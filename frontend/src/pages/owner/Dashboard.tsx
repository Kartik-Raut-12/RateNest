import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { StarRatingDisplay } from '../../components/StarRating'
import api from '../../api/axios'
import toast from 'react-hot-toast'

interface Rater {
  user_id: string
  user_name: string
  user_email: string
  rating: number
  rated_at: string
}

interface OwnerDashboardData {
  store: { id: string; name: string; email: string; address: string | null } | null
  average_rating: number | null
  raters: Rater[]
}

const OwnerDashboard = () => {
  const [data, setData] = useState<OwnerDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/owner/dashboard')
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Hero skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex-shrink-0" />
          <div className="space-y-2.5 flex-1">
            <div className="h-5 bg-gray-200 rounded w-48" />
            <div className="h-3.5 bg-gray-100 rounded w-64" />
            <div className="h-3.5 bg-gray-100 rounded w-44" />
          </div>
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
              <div className="w-9 h-9 bg-gray-100 rounded-xl mb-4" />
              <div className="h-7 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-36" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-32" />
                <div className="h-3 bg-gray-50 rounded w-44" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (!data?.store) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">No store assigned</h2>
        <p className="text-sm text-gray-400 max-w-xs mx-auto">Contact an administrator to link your store to this account.</p>
      </div>
    </div>
  )

  const avgRounded = data.average_rating != null ? Math.round(data.average_rating * 10) / 10 : null
  const storeInitial = data.store.name.trim()[0].toUpperCase()

  const ratingScore = avgRounded ?? 0
  const scoreColor =
    ratingScore >= 4 ? 'text-emerald-600' :
    ratingScore >= 3 ? 'text-amber-600' :
    ratingScore > 0  ? 'text-red-500' : 'text-gray-400'

  const scoreBg =
    ratingScore >= 4 ? 'bg-emerald-50' :
    ratingScore >= 3 ? 'bg-amber-50' :
    ratingScore > 0  ? 'bg-red-50' : 'bg-gray-50'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Store hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0 shadow-sm">
              {storeInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Your Store</p>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{data.store.name}</h1>
                </div>
                <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <div className="mt-2 space-y-0.5">
                <p className="text-sm text-gray-500 truncate">{data.store.email}</p>
                {data.store.address && (
                  <p className="text-xs text-gray-400 truncate">{data.store.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Avg rating */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${scoreBg}`}>
              <svg className={`w-[18px] h-[18px] fill-current ${scoreColor}`} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            {avgRounded != null ? (
              <>
                <p className="text-2xl font-bold text-gray-900">{avgRounded} <span className="text-base font-medium text-gray-400">/ 5</span></p>
                <div className="mt-1.5">
                  <StarRatingDisplay value={data.average_rating!} size="sm" showNumber={false} />
                </div>
              </>
            ) : (
              <p className="text-2xl font-bold text-gray-300">—</p>
            )}
            <p className="text-xs text-gray-400 font-medium mt-2">Average Rating</p>
          </div>

          {/* Total reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 bg-indigo-50">
              <svg className="w-[18px] h-[18px] text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.raters.length}</p>
            <p className="text-xs text-gray-400 font-medium mt-2">Total Reviews</p>
          </div>

          {/* Rating health */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 bg-amber-50">
              <svg className="w-[18px] h-[18px] text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {avgRounded == null ? '—' :
               avgRounded >= 4 ? 'Great' :
               avgRounded >= 3 ? 'Good' :
               avgRounded >= 2 ? 'Fair' : 'Poor'}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-2">Rating Health</p>
          </div>
        </div>

        {/* Customer ratings table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Customer Reviews</h2>
              <p className="text-xs text-gray-400 mt-0.5">Everyone who rated your store</p>
            </div>
            {data.raters.length > 0 && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                {data.raters.length} {data.raters.length === 1 ? 'review' : 'reviews'}
              </span>
            )}
          </div>

          {data.raters.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-600">No reviews yet</p>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto">Ratings will appear here once customers rate your store.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</th>
                    <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.raters.map(r => {
                    const initials = r.user_name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase()
                    return (
                      <tr key={r.user_id} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="px-5 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <span className="font-medium text-gray-800">{r.user_name}</span>
                          </div>
                        </td>
                        <td className="px-5 sm:px-6 py-4 text-gray-400 text-xs hidden sm:table-cell">{r.user_email}</td>
                        <td className="px-5 sm:px-6 py-4">
                          <StarRatingDisplay value={r.rating} size="sm" />
                        </td>
                        <td className="px-5 sm:px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(r.rated_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default OwnerDashboard
