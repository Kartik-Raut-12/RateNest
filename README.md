# RateNest

A full-stack store rating platform built as a coding challenge. Three distinct user roles — System Administrator, Store Owner, and Normal User — each with their own purpose-built interface.

**Stack:** Express.js · TypeScript · Supabase (PostgreSQL) · React 19 · Vite · Tailwind CSS · Playwright

---

## What It Does

| Role | What they can do |
|------|-----------------|
| **Admin** | Full CRUD on users and stores, dashboard with live stats and recent activity |
| **Store Owner** | Read-only dashboard — sees their store's average rating and every customer who rated them |
| **User** | Browse all stores, submit a 1–5 star rating, edit their rating anytime |

---

## Features

**Admin Panel**
- Sidebar layout with Dashboard, Users, Stores navigation
- Dashboard: total users/stores/ratings, unassigned stores alert, recent members, top-rated stores
- Users: filterable + sortable table, add/edit/delete with validation modals, role management
- Stores: filterable + sortable table, add/edit/delete, owner assignment with conflict prevention
- One store per owner enforced at DB constraint + API + UI level

**User Portal**
- Browse all stores with search by name/address
- See overall average rating and your own submitted rating per store
- Submit or edit a 1–5 star rating (one rating per store enforced)

**Store Owner Portal**
- Store info card with active status
- Avg rating with color-coded health label (Great / Good / Fair / Poor)
- Full customer reviews table with initials avatars

**All Portals**
- JWT authentication with auto-logout on token expiry
- Password change via profile dropdown (accessible on every page)
- Fully responsive — works on mobile
- Skeleton loading states throughout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, TypeScript |
| Database | Supabase (PostgreSQL) via `@supabase/supabase-js` |
| Auth | JWT (`jsonwebtoken`), bcrypt password hashing |
| Validation | `express-validator` |
| Frontend | React 19, Vite, TypeScript |
| Styling | Tailwind CSS |
| HTTP Client | Axios with request/response interceptors |
| E2E Tests | Playwright (53 tests across 4 suites) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account

### 1. Clone the repo

```bash
git clone <repo-url>
cd RateNest
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

JWT_SECRET=any_long_random_string_min_64_chars
```

> Get `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from your Supabase project → Settings → API

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

The default `.env` works as-is for local development:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database setup

Run the following SQL in your Supabase **SQL Editor**:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  address VARCHAR(400),
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER', 'STORE_OWNER')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  address VARCHAR(400),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One store per owner enforced at DB level
ALTER TABLE stores ADD CONSTRAINT stores_owner_id_unique UNIQUE (owner_id);

-- Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value >= 1 AND value <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);
```

Then **disable Row Level Security** on all 3 tables:  
Supabase Dashboard → Table Editor → each table → RLS → Disable

Then create the Postgres function used by the stores listing:

```sql
CREATE OR REPLACE FUNCTION get_stores_with_ratings(current_user_id UUID)
RETURNS TABLE (
  id UUID, name TEXT, address TEXT,
  average_rating NUMERIC, user_rating INT, user_rating_id UUID
) AS $$
  SELECT
    s.id, s.name, s.address,
    ROUND(AVG(r.value)::numeric, 1) as average_rating,
    ur.value as user_rating,
    ur.id as user_rating_id
  FROM stores s
  LEFT JOIN ratings r ON s.id = r.store_id
  LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = current_user_id
  GROUP BY s.id, ur.value, ur.id
$$ LANGUAGE sql STABLE;
```

### 5. Seed the database

```bash
cd backend
npm run seed
```

This creates 1 admin, 2 store owners with linked stores, 3 normal users, and sample ratings.

### 6. Run the app

Open two terminals:

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Test Credentials

Use these to test all three portals immediately after seeding:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@ratenest.com` | `Admin@123` |
| **Store Owner** | `john.owner@ratenest.com` | `Owner@123` |
| **Normal User** | `alice@ratenest.com` | `User@1234` |

> All three are created by the seed script. The admin can also create additional users of any role via the admin panel.

---

## API Reference

All routes are prefixed with `/api`.

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/auth/register` | Public | Register as a normal user |
| POST | `/auth/login` | Public | Login (all roles) |
| PATCH | `/auth/change-password` | Any authenticated | Change own password |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/dashboard` | Stats: user/store/rating counts |
| GET | `/admin/users` | List users — filter by name, email, address, role; sort any column |
| POST | `/admin/users` | Create user (any role) |
| GET | `/admin/users/:id` | User detail — includes store rating if STORE_OWNER |
| PATCH | `/admin/users/:id` | Update user |
| DELETE | `/admin/users/:id` | Delete user (cannot delete self) |
| GET | `/admin/stores` | List stores with avg ratings and owner names |
| POST | `/admin/stores` | Create store |
| PATCH | `/admin/stores/:id` | Update store |
| DELETE | `/admin/stores/:id` | Delete store (cascades ratings) |

### Stores & Ratings (Normal User)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/stores` | All stores with avg rating + user's own rating |
| POST | `/ratings` | Submit a rating (1–5) |
| PATCH | `/ratings/:id` | Update own rating |

### Store Owner
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/owner/dashboard` | Store info + avg rating + full rater list |

---

## Project Structure

```
RateNest/
├── backend/
│   └── src/
│       ├── controllers/     # Route handlers (auth, admin, store, rating, owner)
│       ├── routes/          # Express routers
│       ├── middleware/       # JWT auth + role guard
│       ├── validators/      # express-validator rule sets
│       └── config/          # Supabase client init
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── admin/       # Dashboard, UsersList, UserDetail, StoresList, ChangePassword
│       │   ├── user/        # StoresList, ChangePassword
│       │   └── owner/       # Dashboard, ChangePassword
│       ├── components/      # AdminLayout (sidebar), Navbar, StarRating, ProtectedRoute
│       ├── context/         # AuthContext (JWT state)
│       └── api/             # Axios instance with interceptors
└── e2e/
    └── tests/               # Playwright test suites (auth, admin, user, owner)
```

---

## E2E Tests

53 tests across 4 suites covering all critical user flows.

```bash
cd e2e
npm install
npx playwright install chromium

# Make sure backend (port 5000) and frontend (port 5173) are running, then:
npm test

# Run with browser visible
npm run test:headed

# Open interactive UI
npm run test:ui
```

| Suite | Coverage |
|-------|----------|
| `auth.spec.ts` | Login, register, validation, role-based redirects |
| `admin.spec.ts` | Dashboard stats, user/store CRUD, filters, modals |
| `user.spec.ts` | Store browsing, rating submission, rating edit |
| `owner.spec.ts` | Dashboard load, rating display, change password |

---

## Validation Rules

Applied on both frontend and backend:

| Field | Rule |
|-------|------|
| Name | 20–60 characters |
| Email | Valid format |
| Password | 8–16 chars · at least 1 uppercase · at least 1 special character |
| Address | Max 400 characters (optional) |
| Rating | Integer 1–5 only |

---

## Key Design Decisions

- **One store per owner** — enforced at three layers: DB `UNIQUE` constraint on `owner_id`, API 409 check, and frontend disabled dropdown options
- **Service role key** — backend uses Supabase service role key (bypasses RLS) to keep all auth logic in the Express layer with JWTs
- **Role-based layouts** — Admin gets a sidebar panel; User/Owner get a minimal navbar with profile dropdown
- **No text reviews** — PRD specifies numeric ratings only (1–5 integer value)
