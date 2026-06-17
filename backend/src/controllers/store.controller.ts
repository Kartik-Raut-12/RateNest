import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

// GET /api/stores?search=&sortBy=name&order=asc
export const getStores = async (req: Request, res: Response): Promise<void> => {
  const { search, name, address, sortBy, order } = req.query
  const userId = req.user!.id

  const { data, error } = await supabase.rpc('get_stores_with_ratings', {
    current_user_id: userId,
  })

  if (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stores' })
    return
  }

  let stores = data as {
    id: string
    name: string
    email: string
    address: string | null
    average_rating: number | null
    user_rating: number | null
    user_rating_id: string | null
  }[]

  // Apply search filters
  if (search) {
    const q = (search as string).toLowerCase()
    stores = stores.filter(s =>
      s.name.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q)
    )
  } else {
    if (name) {
      const q = (name as string).toLowerCase()
      stores = stores.filter(s => s.name.toLowerCase().includes(q))
    }
    if (address) {
      const q = (address as string).toLowerCase()
      stores = stores.filter(s => s.address?.toLowerCase().includes(q))
    }
  }

  // Apply sorting
  const validSortFields = ['name', 'address', 'average_rating']
  if (sortBy && validSortFields.includes(sortBy as string)) {
    const field = sortBy as 'name' | 'address' | 'average_rating'
    const asc = order !== 'desc'
    stores.sort((a, b) => {
      if (field === 'average_rating') {
        const aVal = a.average_rating ?? -1
        const bVal = b.average_rating ?? -1
        return asc ? aVal - bVal : bVal - aVal
      }
      const aVal = (a[field] ?? '').toLowerCase()
      const bVal = (b[field] ?? '').toLowerCase()
      if (aVal < bVal) return asc ? -1 : 1
      if (aVal > bVal) return asc ? 1 : -1
      return 0
    })
  }

  res.json({ success: true, data: stores })
}
