import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { StarRatingDisplay } from '../../components/StarRating'
import api from '../../api/axios'
import toast from 'react-hot-toast'

interface UserDetail {
  id: string
  name: string
  email: string
  address: string | null
  role: string
  created_at: string
  store_name?: string | null
  average_rating?: number | null
}

const ROLE_STYLE: Record<string, { badge: string; label: string }> = {
  ADMIN: { badge: 'bg-red-100 text-red-700', label: 'Admin' },
  USER: { badge: 'bg-indigo-100 text-indigo-700', label: 'User' },
  STORE_OWNER: { badge: 'bg-emerald-100 text-emerald-700', label: 'Store Owner' },
}

const AdminUserDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get(`/admin/users/${id}`)
      .then(res => setUser(res.data.data))
      .catch(() => toast.error('Failed to load user'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <AdminLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-48 mb-8" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="w-36 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
              <div className="w-40 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )

  if (!user) return (
    <AdminLayout>
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 font-medium mb-3">User not found</p>
        <Link to="/admin/users" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
          ← Back to Users
        </Link>
      </div>
    </AdminLayout>
  )

  const roleInfo = ROLE_STYLE[user.role] ?? { badge: 'bg-gray-100 text-gray-600', label: user.role }
  const initials = user.name.trim().split(/\s+/).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
  const avatarColor = user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : user.role === 'STORE_OWNER' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link to="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link to="/admin/users" className="hover:text-indigo-600 transition-colors">Users</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-[140px]">{user.name}</span>
        </nav>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Profile header */}
          <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${avatarColor}`}>
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${roleInfo.badge}`}>
                  {roleInfo.label}
                </span>
                <span className="text-xs text-gray-400">
                  Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="divide-y divide-gray-50">
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Address" value={user.address || '—'} />
            <InfoRow label="Member since" value={new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} />

            {user.role === 'STORE_OWNER' && (
              <>
                <div className="px-6 py-3 bg-gray-50/50">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Store Information</p>
                </div>
                <InfoRow label="Owned Store" value={user.store_name || 'No store assigned'} />
                <InfoRow
                  label="Store Rating"
                  value={
                    user.average_rating != null
                      ? <StarRatingDisplay value={user.average_rating} />
                      : <span className="text-gray-400 italic text-sm">No ratings yet</span>
                  }
                />
              </>
            )}
          </div>
        </div>

        <div className="mt-5">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Users
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between px-6 py-3.5 gap-4">
    <span className="text-sm text-gray-400 font-medium flex-shrink-0">{label}</span>
    <span className="text-sm text-gray-800 text-right">{value}</span>
  </div>
)

export default AdminUserDetail
