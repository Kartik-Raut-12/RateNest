import { useEffect, useState, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import { StarRatingDisplay, StarRatingInput } from '../../components/StarRating'
import api from '../../api/axios'
import toast from 'react-hot-toast'

interface Store {
  id: string
  name: string
  email: string
  address: string | null
  average_rating: number | null
  user_rating: number | null
  user_rating_id: string | null
}

const UserStoresList = () => {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const fetchStores = useCallback(() => {
    setLoading(true)
    setError(false)
    const params: Record<string, string> = { sortBy: sortField, order: sortOrder }
    if (search) params.search = search
    api.get('/stores', { params })
      .then(res => setStores(res.data.data))
      .catch(() => { toast.error('Failed to load stores'); setError(true) })
      .finally(() => setLoading(false))
  }, [search, sortField, sortOrder])

  useEffect(() => { fetchStores() }, [fetchStores])

  const handleRate = async (storeId: string, ratingId: string | null, value: number) => {
    try {
      if (ratingId) {
        await api.patch(`/ratings/${ratingId}`, { value })
        toast.success('Rating updated!')
      } else {
        await api.post('/ratings', { store_id: storeId, value })
        toast.success('Rating submitted!')
      }
      fetchStores()
    } catch {
      toast.error('Failed to submit rating')
    }
  }

  const toggleSort = (field: string) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortOrder('asc') }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">Explore Stores</h1>
          <p className="text-sm text-gray-500 mt-1">Browse and rate stores on RateNest</p>
        </div>

        {/* Search + Sort */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 transition-colors"
              placeholder="Search by name or address…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search stores"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium text-gray-400 hidden sm:block">Sort by</span>
            {[['name', 'Name'], ['average_rating', 'Rating']].map(([field, label]) => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                  sortField === field
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                }`}
                aria-pressed={sortField === field}
              >
                {label} {sortField === field ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3.5 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-3/4" />
                <div className="h-3.5 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="border-t border-gray-50 pt-3.5">
                  <div className="h-7 bg-gray-100 rounded w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-4">Failed to load stores</p>
            <button onClick={fetchStores} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
              Retry
            </button>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-500">No stores found</p>
            {search && <p className="text-xs text-gray-400 mt-1">Try a different search term</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stores.map(store => (
              <StoreCard key={store.id} store={store} onRate={handleRate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface StoreCardProps {
  store: Store
  onRate: (storeId: string, ratingId: string | null, value: number) => void
}

const StoreCard = ({ store, onRate }: StoreCardProps) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card-hover transition-shadow flex flex-col">
    <div className="p-5 flex-1">
      <h2 className="text-base font-bold text-gray-900 leading-snug mb-1">{store.name}</h2>
      <p className="text-xs text-gray-400 mb-1">{store.email}</p>
      {store.address && <p className="text-xs text-gray-400 truncate">{store.address}</p>}

      <div className="mt-3">
        {store.average_rating != null ? (
          <StarRatingDisplay value={store.average_rating} />
        ) : (
          <span className="text-xs text-gray-300 italic">No ratings yet</span>
        )}
      </div>
    </div>

    <div className="border-t border-gray-50 px-5 py-4">
      <StarRatingInput
        storeId={store.id}
        ratingId={store.user_rating_id}
        currentRating={store.user_rating}
        onRate={onRate}
      />
    </div>
  </div>
)

export default UserStoresList
