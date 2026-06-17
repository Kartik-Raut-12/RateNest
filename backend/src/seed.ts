import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { supabase } from './config/supabase'

const SALT_ROUNDS = 10

async function seed() {
  console.log('🌱 Starting seed...')

  // Clear existing data (order matters for FK)
  await supabase.from('ratings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('stores').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('✓ Cleared existing data')

  // Create users
  const adminHash = await bcrypt.hash('Admin@123', SALT_ROUNDS)
  const ownerHash = await bcrypt.hash('Owner@123', SALT_ROUNDS)
  const userHash = await bcrypt.hash('User@1234', SALT_ROUNDS)

  const { data: users, error: userErr } = await supabase.from('users').insert([
    {
      name: 'Admin User',
      email: 'admin@ratenest.com',
      password_hash: adminHash,
      address: '123 Admin Street, Admin City',
      role: 'ADMIN',
    },
    {
      name: 'John Store Owner',
      email: 'john.owner@ratenest.com',
      password_hash: ownerHash,
      address: '45 Owner Lane, Business District',
      role: 'STORE_OWNER',
    },
    {
      name: 'Jane Store Owner',
      email: 'jane.owner@ratenest.com',
      password_hash: ownerHash,
      address: '67 Market Road, Commerce Area',
      role: 'STORE_OWNER',
    },
    {
      name: 'Alice Johnson',
      email: 'alice@ratenest.com',
      password_hash: userHash,
      address: '10 User Blvd, Residential Area',
      role: 'USER',
    },
    {
      name: 'Bob Smith',
      email: 'bob@ratenest.com',
      password_hash: userHash,
      address: '22 Maple Street, Suburb',
      role: 'USER',
    },
    {
      name: 'Charlie Davis',
      email: 'charlie@ratenest.com',
      password_hash: userHash,
      address: '8 Oak Avenue, Downtown',
      role: 'USER',
    },
  ]).select()

  if (userErr) { console.error('User seed error:', userErr); process.exit(1) }
  console.log(`✓ Created ${users!.length} users`)

  const admin = users!.find(u => u.role === 'ADMIN')!
  const johnOwner = users!.find(u => u.email === 'john.owner@ratenest.com')!
  const janeOwner = users!.find(u => u.email === 'jane.owner@ratenest.com')!
  const alice = users!.find(u => u.email === 'alice@ratenest.com')!
  const bob = users!.find(u => u.email === 'bob@ratenest.com')!
  const charlie = users!.find(u => u.email === 'charlie@ratenest.com')!

  // Create stores
  const { data: stores, error: storeErr } = await supabase.from('stores').insert([
    {
      name: "John's Electronics",
      email: 'johns.electronics@ratenest.com',
      address: '100 Tech Park, Silicon Valley',
      owner_id: johnOwner.id,
    },
    {
      name: "Jane's Bakery",
      email: 'janes.bakery@ratenest.com',
      address: '55 Sweet Street, Pastry District',
      owner_id: janeOwner.id,
    },
    {
      name: 'City Supermart',
      email: 'city.supermart@ratenest.com',
      address: '300 Central Ave, Midtown',
      owner_id: null,
    },
    {
      name: 'The Book Nook',
      email: 'the.booknook@ratenest.com',
      address: '12 Library Lane, Academic Quarter',
      owner_id: null,
    },
  ]).select()

  if (storeErr) { console.error('Store seed error:', storeErr); process.exit(1) }
  console.log(`✓ Created ${stores!.length} stores`)

  const electronics = stores!.find(s => s.name === "John's Electronics")!
  const bakery = stores!.find(s => s.name === "Jane's Bakery")!
  const supermart = stores!.find(s => s.name === 'City Supermart')!
  const bookNook = stores!.find(s => s.name === 'The Book Nook')!

  // Create ratings
  const { data: ratings, error: ratingErr } = await supabase.from('ratings').insert([
    { user_id: alice.id, store_id: electronics.id, value: 5 },
    { user_id: bob.id, store_id: electronics.id, value: 4 },
    { user_id: charlie.id, store_id: electronics.id, value: 3 },
    { user_id: alice.id, store_id: bakery.id, value: 5 },
    { user_id: bob.id, store_id: bakery.id, value: 5 },
    { user_id: alice.id, store_id: supermart.id, value: 3 },
    { user_id: charlie.id, store_id: supermart.id, value: 2 },
    { user_id: bob.id, store_id: bookNook.id, value: 4 },
    { user_id: charlie.id, store_id: bookNook.id, value: 5 },
  ]).select()

  if (ratingErr) { console.error('Rating seed error:', ratingErr); process.exit(1) }
  console.log(`✓ Created ${ratings!.length} ratings`)

  console.log('\n✅ Seed complete!\n')
  console.log('📋 Test Credentials:')
  console.log('  Admin:        admin@ratenest.com     / Admin@123')
  console.log('  Store Owner:  john.owner@ratenest.com / Owner@123')
  console.log('  Store Owner:  jane.owner@ratenest.com / Owner@123')
  console.log('  User:         alice@ratenest.com      / User@1234')
  console.log('  User:         bob@ratenest.com        / User@1234')
  console.log('  User:         charlie@ratenest.com    / User@1234')
  console.log('')

  // Suppress unused variable warning
  void admin
}

seed().catch(err => { console.error(err); process.exit(1) })
