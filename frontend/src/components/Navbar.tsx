import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    setMenuOpen(false)
    setDropdownOpen(false)
    logout()
    toast.success('Signed out successfully')
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  // Nav links — Change Password removed from here, lives in profile dropdown
  const userLinks = [
    { to: '/stores', label: 'Stores' },
  ]
  const ownerLinks: { to: string; label: string }[] = []

  // Change Password destination per role
  const changePasswordHref =
    user?.role === 'USER' ? '/change-password' :
    user?.role === 'STORE_OWNER' ? '/owner/change-password' : null

  const links =
    user?.role === 'USER' ? userLinks :
    user?.role === 'STORE_OWNER' ? ownerLinks : []

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const avatarStyle: Record<string, string> = {
    USER: 'bg-indigo-100 text-indigo-700',
    STORE_OWNER: 'bg-emerald-100 text-emerald-700',
  }

  const roleLabel: Record<string, string> = {
    USER: 'User',
    STORE_OWNER: 'Store Owner',
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close dropdown on route change
  useEffect(() => { setDropdownOpen(false) }, [location.pathname])

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <StarIcon />
              </div>
              <span className="text-[17px] font-bold text-gray-900 tracking-tight">RateNest</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5">
              {links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(l.to)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Desktop profile dropdown */}
            <div className="hidden md:flex items-center" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className={`flex items-center gap-2.5 pl-4 border-l border-gray-100 py-1.5 pr-2 rounded-xl transition-colors ${
                  dropdownOpen ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
                aria-label="Profile menu"
                aria-expanded={dropdownOpen}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarStyle[user?.role ?? ''] ?? 'bg-gray-100 text-gray-500'}`}>
                  {initials}
                </div>
                <div className="leading-tight hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-800 max-w-[100px] truncate">{user?.name?.split(' ')[0]}</p>
                  <p className="text-[11px] text-gray-400">{roleLabel[user?.role ?? ''] ?? user?.role}</p>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform hidden lg:block ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute top-[calc(100%-4px)] right-4 lg:right-6 w-60 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
                  {/* Profile card */}
                  <div className="px-4 py-3.5 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarStyle[user?.role ?? ''] ?? 'bg-gray-100 text-gray-500'}`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center mt-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold border
                      ${user?.role === 'STORE_OWNER'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                      {roleLabel[user?.role ?? ''] ?? user?.role}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5 space-y-0.5">
                    {changePasswordHref && (
                      <Link
                        to={changePasswordHref}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                      >
                        <KeyIcon />
                        Change Password
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogoutIcon />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 z-50 md:hidden bg-white border-b border-gray-100 shadow-xl">
            <div className="px-4 pt-3 pb-4 space-y-1">

              {/* User identity card */}
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarStyle[user?.role ?? ''] ?? 'bg-gray-100 text-gray-500'}`}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Nav links */}
              {links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(l.to)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {l.label}
                  {isActive(l.to) && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                </Link>
              ))}

              {/* Change Password */}
              {changePasswordHref && (
                <Link
                  to={changePasswordHref}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(changePasswordHref)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <KeyIcon />
                  Change Password
                </Link>
              )}

              {/* Logout */}
              <div className="pt-2 mt-1 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogoutIcon />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

const StarIcon = () => (
  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const KeyIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

export default Navbar
