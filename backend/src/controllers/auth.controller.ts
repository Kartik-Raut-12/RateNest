import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase'

export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })) })
    return
  }

  const { name, email, password, address } = req.body

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
    .insert({ name, email, password_hash, address: address || null, role: 'USER' })
    .select('id, name, email, address, role, created_at')
    .single()

  if (error) {
    res.status(500).json({ success: false, error: 'Failed to create user' })
    return
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  res.status(201).json({ success: true, data: { token, user } })
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })) })
    return
  }

  const { email, password } = req.body

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, address, role, password_hash, created_at')
    .eq('email', email)
    .single()

  if (error || !user) {
    res.status(401).json({ success: false, error: 'Invalid email or password' })
    return
  }

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    res.status(401).json({ success: false, error: 'Invalid email or password' })
    return
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  const { password_hash, ...userWithoutPassword } = user

  res.json({ success: true, data: { token, user: userWithoutPassword } })
}

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })) })
    return
  }

  const { currentPassword, newPassword } = req.body
  const userId = req.user!.id

  const { data: user, error } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single()

  if (error || !user) {
    res.status(404).json({ success: false, error: 'User not found' })
    return
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash)
  if (!isMatch) {
    res.status(401).json({ success: false, error: 'Current password is incorrect' })
    return
  }

  const password_hash = await bcrypt.hash(newPassword, 10)

  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash })
    .eq('id', userId)

  if (updateError) {
    res.status(500).json({ success: false, error: 'Failed to update password' })
    return
  }

  res.json({ success: true, message: 'Password updated successfully' })
}
