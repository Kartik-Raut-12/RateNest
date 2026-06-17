import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Unauthorized = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const goHome = () => {
    if (user?.role === 'ADMIN') navigate('/admin/dashboard')
    else if (user?.role === 'STORE_OWNER') navigate('/owner/dashboard')
    else navigate('/stores')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-6xl font-extrabold text-gray-900 mb-3">403</p>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Access denied</h1>
        <p className="text-gray-500 text-sm mb-8">You don't have permission to view this page.</p>
        <button
          onClick={goHome}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go to dashboard
        </button>
      </div>
    </div>
  )
}

export default Unauthorized
