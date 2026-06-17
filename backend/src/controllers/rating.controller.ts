import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { supabase } from '../config/supabase'

// POST /api/ratings
export const submitRating = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    })
    return
  }

  const { store_id, value } = req.body
  const userId = req.user!.id

  // Verify store exists
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('id', store_id)
    .single()

  if (!store) {
    res.status(404).json({ success: false, error: 'Store not found' })
    return
  }

  // Check if user already rated this store
  const { data: existing } = await supabase
    .from('ratings')
    .select('id')
    .eq('user_id', userId)
    .eq('store_id', store_id)
    .single()

  if (existing) {
    res.status(409).json({
      success: false,
      error: 'You have already rated this store. Use PATCH to update your rating.',
    })
    return
  }

  const { data: rating, error } = await supabase
    .from('ratings')
    .insert({ user_id: userId, store_id, value })
    .select('id, store_id, value, created_at')
    .single()

  if (error) {
    res.status(500).json({ success: false, error: 'Failed to submit rating' })
    return
  }

  res.status(201).json({ success: true, data: rating })
}

// PATCH /api/ratings/:id
export const updateRating = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    })
    return
  }

  const { id } = req.params
  const { value } = req.body
  const userId = req.user!.id

  // Verify rating exists and belongs to current user
  const { data: existing } = await supabase
    .from('ratings')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (!existing) {
    res.status(404).json({ success: false, error: 'Rating not found' })
    return
  }

  if (existing.user_id !== userId) {
    res.status(403).json({ success: false, error: 'You can only edit your own ratings' })
    return
  }

  const { data: rating, error } = await supabase
    .from('ratings')
    .update({ value })
    .eq('id', id)
    .select('id, store_id, value, created_at')
    .single()

  if (error) {
    res.status(500).json({ success: false, error: 'Failed to update rating' })
    return
  }

  res.json({ success: true, data: rating })
}
