-- RateNest Database Migration
-- Run this entire file in Supabase SQL Editor

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  address VARCHAR(400),
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER', 'STORE_OWNER')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: stores
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  address VARCHAR(400),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: ratings
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value >= 1 AND value <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

-- RPC Function: get stores with avg rating + user's own rating
CREATE OR REPLACE FUNCTION get_stores_with_ratings(current_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  average_rating NUMERIC,
  user_rating INT,
  user_rating_id UUID
) AS $$
  SELECT
    s.id,
    s.name,
    s.address,
    ROUND(AVG(r.value)::numeric, 1) AS average_rating,
    ur.value AS user_rating,
    ur.id AS user_rating_id
  FROM stores s
  LEFT JOIN ratings r ON s.id = r.store_id
  LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = current_user_id
  GROUP BY s.id, ur.value, ur.id
$$ LANGUAGE sql STABLE;
