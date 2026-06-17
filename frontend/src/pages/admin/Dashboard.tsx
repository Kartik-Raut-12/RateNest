import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

interface DashboardStats {
  total_users: number
  total_stores: number
  total_ratings: number
}

interface RecentUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER' | 'STORE_OWNER'
  created_at: string
}

interface Store {
  id: string
  name: string
  owner_id: string | null
  average_rating: number | null
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  USER: 'bg-indigo-100 text-indigo-700',
  STORE_OWNER: 'bg-emerald-100 text-emerald-700',
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'bg-red-50 text-red-700 border-red-100',
  USER: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  STORE_OWNER: 'bg-emerald-50 text-emerald-700 border-emerald-100',
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [unassignedCount, setUnassignedCount] = useState<number | null>(null)
  const [topStores, setTopStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  const firstName = user?.name?.split(' ')[0] ?? 'Admin'

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, usersRes, storesRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/users', { params: { sortBy: 'created_at', order: 'desc' } }),
          api.get('/admin/stores', { params: { sortBy: 'average_rating', order: 'desc' } }),
        ])
        setStats(statsRes.data.data)
        setRecentUsers((usersRes.data.data as RecentUser[]).slice(0, 5))
        const storesData = storesRes.data.data as Store[]
        setUnassignedCount(storesData.filter(s => !s.owner_id).length)
        setTopStores(storesData.filter(s => s.average_rating !== null).slice(0, 3))
      } catch {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
          <p className="text-sm text-gray-400 mt-1">Here's what's happening on RateNest.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="w-9 h-9 bg-gray-100 rounded-xl mb-4" />
                <div className="w-14 h-7 bg-gray-200 rounded mb-2" />
                <div className="w-20 h-3.5 bg-gray-100 rounded" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                label="Total Users"
                value={stats?.total_users ?? 0}
                href="/admin/users"
                icon={<UsersIcon />}
                iconBg="bg-indigo-50 text-indigo-600"
                accent="hover:border-indigo-200"
              />
              <StatCard
                label="Total Stores"
                value={stats?.total_stores ?? 0}
                href="/admin/stores"
                icon={<StoresIcon />}
                iconBg="bg-emerald-50 text-emerald-600"
                accent="hover:border-emerald-200"
              />
              <StatCard
                label="Total Ratings"
                value={stats?.total_ratings ?? 0}
                icon={<StarIcon />}
                iconBg="bg-amber-50 text-amber-600"
                accent="hover:border-amber-200"
              />
              <StatCard
                label="Unassigned Stores"
                value={unassignedCount ?? 0}
                href="/admin/stores"
                icon={<UnassignedIcon />}
                iconBg={unassignedCount ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-400'}
                accent={unassignedCount ? 'hover:border-rose-200' : 'hover:border-gray-200'}
                alert={!!unassignedCount}
              />
            </>
          )}
        </div>

        {/* Two-column section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Recent Members — 3/5 width */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Recent Members</h2>
                <p className="text-xs text-gray-400 mt-0.5">Latest users who joined the platform</p>
              </div>
              <Link
                to="/admin/users"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="w-32 h-3.5 bg-gray-100 rounded" />
                      <div className="w-44 h-3 bg-gray-50 rounded" />
                    </div>
                    <div className="w-16 h-5 bg-gray-100 rounded-full" />
                  </div>
                ))
              ) : recentUsers.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-gray-400">No users yet</p>
                </div>
              ) : recentUsers.map(u => {
                const initials = u.name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase()
                return (
                  <Link
                    key={u.id}
                    to={`/admin/users/${u.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-500'}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-indigo-700 transition-colors">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${ROLE_BADGE[u.role] ?? 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                        {u.role === 'STORE_OWNER' ? 'Owner' : u.role === 'ADMIN' ? 'Admin' : 'User'}
                      </span>
                      <span className="text-[10px] text-gray-300">
                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right column — 2/5 width */}
          <div className="lg:col-span-2 space-y-5">

            {/* Top Rated Stores */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Top Stores</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Highest rated on platform</p>
                </div>
                <Link
                  to="/admin/stores"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="w-28 h-3.5 bg-gray-100 rounded" />
                        <div className="w-16 h-3 bg-gray-50 rounded" />
                      </div>
                      <div className="w-8 h-5 bg-gray-100 rounded" />
                    </div>
                  ))
                ) : topStores.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-gray-400">No ratings yet</p>
                  </div>
                ) : topStores.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${i === 0 ? 'bg-amber-50 text-amber-600' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-500'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-gray-500">{s.average_rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-3 space-y-1.5">
                <QuickAction
                  to="/admin/users"
                  label="Manage Users"
                  sub="Add, edit or remove users"
                  icon={<UsersIcon />}
                  color="indigo"
                />
                <QuickAction
                  to="/admin/stores"
                  label="Manage Stores"
                  sub="Assign owners, update info"
                  icon={<StoresIcon />}
                  color="emerald"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

/* ─── Stat card ─── */
const StatCard = ({ label, value, href, icon, iconBg, accent, alert }: {
  label: string; value: number; href?: string; icon: React.ReactNode
  iconBg: string; accent: string; alert?: boolean
}) => {
  const inner = (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-full transition-all ${accent} hover:shadow-sm group`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
        </div>
        {alert && value > 0 && (
          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Alert</span>
        )}
        {href && (
          <svg className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </div>
  )
  return href ? <Link to={href} className="block">{inner}</Link> : <div>{inner}</div>
}

/* ─── Quick action ─── */
const QuickAction = ({ to, label, sub, icon, color }: {
  to: string; label: string; sub: string; icon: React.ReactNode; color: 'indigo' | 'emerald'
}) => {
  const isIndigo = color === 'indigo'
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group
        ${isIndigo ? 'hover:bg-indigo-50' : 'hover:bg-emerald-50'}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        ${isIndigo ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold transition-colors ${isIndigo ? 'text-gray-900 group-hover:text-indigo-700' : 'text-gray-900 group-hover:text-emerald-700'}`}>{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

/* ─── Icons ─── */
const UsersIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const StoresIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const UnassignedIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
)

export default AdminDashboard
