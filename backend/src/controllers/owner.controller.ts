import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

// GET /api/owner/dashboard
export const getOwnerDashboard = async (req: Request, res: Response): Promise<void> => {
  const ownerId = req.user!.id

  const { data: ownedStores } = await supabase
    .from('stores')
    .select('id, name, email, address')
    .eq('owner_id', ownerId)
    .limit(1)

  const store = ownedStores?.[0] ?? null

  if (!store) {
    res.json({ success: true, data: { store: null, average_rating: null, raters: [] } })
    return
  }

  const { data: ratings, error } = await supabase
    .from('ratings')
    .select('id, value, created_at, user_id')
    .eq('store_id', store.id)

  if (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch ratings' })
    return
  }

  if (!ratings || ratings.length === 0) {
    res.json({ success: true, data: { store, average_rating: null, raters: [] } })
    return
  }

  const userIds = [...new Set(ratings.map(r => r.user_id))]
  const { data: users } = await supabase
    .from('users')
    .select('id, name, email')
    .in('id', userIds)

  const userMap: Record<string, { name: string; email: string }> = {}
  if (users) {
    for (const u of users) userMap[u.id] = { name: u.name, email: u.email }
  }

  const avg = parseFloat(
    (ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length).toFixed(1)
  )

  const raters = ratings.map(r => ({
    user_id: r.user_id,
    user_name: userMap[r.user_id]?.name ?? 'Unknown',
    user_email: userMap[r.user_id]?.email ?? 'Unknown',
    rating: r.value,
    rated_at: r.created_at,
  }))

  res.json({ success: true, data: { store, average_rating: avg, raters } })
}
