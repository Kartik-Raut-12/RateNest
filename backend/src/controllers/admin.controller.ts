import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import { supabase } from '../config/supabase'

// GET /api/admin/dashboard
export const getDashboard = async (_req: Request, res: Response): Promise<void> => {
  const [
    { count: totalUsers },
    { count: totalStores },
    { count: totalRatings },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('stores').select('*', { count: 'exact', head: true }),
    supabase.from('ratings').select('*', { count: 'exact', head: true }),
  ])

  res.json({
    success: true,
    data: {
      total_users: totalUsers ?? 0,
      total_stores: totalStores ?? 0,
      total_ratings: totalRatings ?? 0,
    },
  })
}

// POST /api/admin/users
export const addUser = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    })
    return
  }

  const { name, email, password, address, role } = req.body

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    res.status(409).json({ success: false, error: 'Email already in use' })
    return
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { data: user, error } = await supabase
    .from('users')
    .insert({ name, email, password_hash, address: address || null, role })
    .select('id, name, email, address, role, created_at')
    .single()

  if (error) {
    res.status(500).json({ success: false, error: 'Failed to create user' })
    return
  }

  res.status(201).json({ success: true, data: user })
}

// GET /api/admin/users?name=&email=&address=&role=&sortBy=name&order=asc
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const { name, email, address, role, sortBy, order } = req.query

  const validSortFields = ['name', 'email', 'address', 'role', 'created_at']
  const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'created_at'
  const ascending = order === 'asc'

  let query = supabase
    .from('users')
    .select('id, name, email, address, role, created_at')
    .order(sortField, { ascending })

  if (name) query = query.ilike('name', `%${name}%`)
  if (email) query = query.ilike('email', `%${email}%`)
  if (address) query = query.ilike('address', `%${address}%`)
  if (role) query = query.eq('role', role as string)

  const { data, error } = await query

  if (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' })
    return
  }

  res.json({ success: true, data })
}

// GET /api/admin/users/:id
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, address, role, created_at')
    .eq('id', id)
    .single()

  if (error || !user) {
    res.status(404).json({ success: false, error: 'User not found' })
    return
  }

  if (user.role === 'STORE_OWNER') {
    const { data: store } = await supabase
      .from('stores')
      .select('id, name')
      .eq('owner_id', id)
      .single()

    if (store) {
      const { data: ratings } = await supabase
        .from('ratings')
        .select('value')
        .eq('store_id', store.id)

      const avg =
        ratings && ratings.length > 0
          ? parseFloat(
              (ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length).toFixed(1)
            )
          : null

      res.json({
        success: true,
        data: { ...user, store_name: store.name, average_rating: avg },
      })
      return
    }
  }

  res.json({ success: true, data: user })
}

// PATCH /api/admin/users/:id
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    })
    return
  }

  const { id } = req.params
  const { name, email, address, role } = req.body

  const { data: existing } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('id', id)
    .single()

  if (!existing) {
    res.status(404).json({ success: false, error: 'User not found' })
    return
  }

  if (email && email !== existing.email) {
    const { data: conflict } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .single()

    if (conflict) {
      res.status(409).json({ success: false, error: 'Email already in use' })
      return
    }
  }

  // If role changing away from STORE_OWNER, unassign their store
  if (role && role !== 'STORE_OWNER' && existing.role === 'STORE_OWNER') {
    await supabase.from('stores').update({ owner_id: null }).eq('owner_id', id)
  }

  const updateData: Record<string, unknown> = {}
  if (name !== undefined) updateData.name = name
  if (email !== undefined) updateData.email = email
  if (address !== undefined) updateData.address = address || null
  if (role !== undefined) updateData.role = role

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select('id, name, email, address, role, created_at')
    .single()

  if (error) {
    res.status(500).json({ success: false, error: 'Failed to update user' })
    return
  }

  res.json({ success: true, data: user })
}

// DELETE /api/admin/users/:id
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const requesterId = req.user!.id

  if (id === requesterId) {
    res.status(400).json({ success: false, error: 'You cannot delete your own account' })
    return
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', id)
    .single()

  if (!existing) {
    res.status(404).json({ success: false, error: 'User not found' })
    return
  }

  if (existing.role === 'STORE_OWNER') {
    await supabase.from('stores').update({ owner_id: null }).eq('owner_id', id)
  }

  await supabase.from('ratings').delete().eq('user_id', id)

  const { error } = await supabase.from('users').delete().eq('id', id)

  if (error) {
    res.status(500).json({ success: false, error: 'Failed to delete user' })
    return
  }

  res.status(200).json({ success: true, message: 'User deleted' })
}

// POST /api/admin/stores
export const addStore = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    })
    return
  }

  const { name, email, address, owner_id } = req.body

  const { data: existing } = await supabase
    .from('stores')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    res.status(409).json({ success: false, error: 'Store email already in use' })
    return
  }

  if (owner_id) {
    const { data: owner } = await supabase
      .from('users')
      .select('role')
      .eq('id', owner_id)
      .single()

    if (!owner || owner.role !== 'STORE_OWNER') {
      res.status(400).json({ success: false, error: 'owner_id must belong to a STORE_OWNER user' })
      return
    }

    const { data: taken } = await supabase
      .from('stores')
      .select('name')
      .eq('owner_id', owner_id)
      .limit(1)

    if (taken && taken.length > 0) {
      res.status(409).json({ success: false, error: `This owner is already assigned to "${taken[0].name}"` })
      return
    }
  }

  const { data: store, error } = await supabase
    .from('stores')
    .insert({ name, email, address: address || null, owner_id: owner_id || null })
    .select('id, name, email, address, owner_id, created_at')
    .single()

  if (error) {
    res.status(500).json({ success: false, error: 'Failed to create store' })
    return
  }

  res.status(201).json({ success: true, data: store })
}

// GET /api/admin/stores?name=&email=&address=&sortBy=name&order=asc
export const getStores = async (req: Request, res: Response): Promise<void> => {
  const { name, email, address, sortBy, order } = req.query

  const validSortFields = ['name', 'email', 'address', 'created_at']
  const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'created_at'
  const ascending = order === 'asc'

  let query = supabase
    .from('stores')
    .select('id, name, email, address, owner_id, created_at')
    .order(sortField, { ascending })

  if (name) query = query.ilike('name', `%${name}%`)
  if (email) query = query.ilike('email', `%${email}%`)
  if (address) query = query.ilike('address', `%${address}%`)

  const { data: stores, error } = await query

  if (error || !stores) {
    res.status(500).json({ success: false, error: 'Failed to fetch stores' })
    return
  }

  // Compute avg rating per store
  const { data: ratings } = await supabase
    .from('ratings')
    .select('store_id, value')

  const avgMap: Record<string, number | null> = {}
  if (ratings) {
    const grouped: Record<string, number[]> = {}
    for (const r of ratings) {
      if (!grouped[r.store_id]) grouped[r.store_id] = []
      grouped[r.store_id].push(r.value)
    }
    for (const [storeId, values] of Object.entries(grouped)) {
      avgMap[storeId] = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
    }
  }

  // Fetch owner names
  const ownerIds = stores.map(s => s.owner_id).filter(Boolean) as string[]
  const ownerMap: Record<string, string> = {}
  if (ownerIds.length > 0) {
    const { data: owners } = await supabase
      .from('users')
      .select('id, name')
      .in('id', ownerIds)
    if (owners) {
      for (const o of owners) ownerMap[o.id] = o.name
    }
  }

  const storesWithRating = stores.map(s => ({
    ...s,
    average_rating: avgMap[s.id] ?? null,
    owner_name: s.owner_id ? (ownerMap[s.owner_id] ?? null) : null,
  }))

  // Handle sort by average_rating in JS
  if (sortBy === 'average_rating') {
    storesWithRating.sort((a, b) => {
      const aVal = a.average_rating ?? -1
      const bVal = b.average_rating ?? -1
      return ascending ? aVal - bVal : bVal - aVal
    })
  }

  res.json({ success: true, data: storesWithRating })
}

// PATCH /api/admin/stores/:id
export const updateStore = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    })
    return
  }

  const { id } = req.params
  const { name, email, address, owner_id } = req.body

  const { data: existing } = await supabase
    .from('stores')
    .select('id, email')
    .eq('id', id)
    .single()

  if (!existing) {
    res.status(404).json({ success: false, error: 'Store not found' })
    return
  }

  if (email && email !== existing.email) {
    const { data: conflict } = await supabase
      .from('stores')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .single()

    if (conflict) {
      res.status(409).json({ success: false, error: 'Store email already in use' })
      return
    }
  }

  if (owner_id) {
    const { data: owner } = await supabase
      .from('users')
      .select('role')
      .eq('id', owner_id)
      .single()

    if (!owner || owner.role !== 'STORE_OWNER') {
      res.status(400).json({ success: false, error: 'owner_id must belong to a STORE_OWNER user' })
      return
    }

    const { data: taken } = await supabase
      .from('stores')
      .select('name')
      .eq('owner_id', owner_id)
      .neq('id', id)
      .limit(1)

    if (taken && taken.length > 0) {
      res.status(409).json({ success: false, error: `This owner is already assigned to "${taken[0].name}"` })
      return
    }
  }

  const updateData: Record<string, unknown> = {}
  if (name !== undefined) updateData.name = name
  if (email !== undefined) updateData.email = email
  if (address !== undefined) updateData.address = address || null
  if ('owner_id' in req.body) updateData.owner_id = owner_id || null

  const { data: store, error } = await supabase
    .from('stores')
    .update(updateData)
    .eq('id', id)
    .select('id, name, email, address, owner_id, created_at')
    .single()

  if (error) {
    res.status(500).json({ success: false, error: 'Failed to update store' })
    return
  }

  res.json({ success: true, data: store })
}

// DELETE /api/admin/stores/:id
export const deleteStore = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  const { data: existing } = await supabase
    .from('stores')
    .select('id')
    .eq('id', id)
    .single()

  if (!existing) {
    res.status(404).json({ success: false, error: 'Store not found' })
    return
  }

  await supabase.from('ratings').delete().eq('store_id', id)

  const { error } = await supabase.from('stores').delete().eq('id', id)

  if (error) {
    res.status(500).json({ success: false, error: 'Failed to delete store' })
    return
  }

  res.status(200).json({ success: true, message: 'Store deleted' })
}
