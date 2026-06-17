import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import Unauthorized from './pages/Unauthorized'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsersList from './pages/admin/UsersList'
import AdminUserDetail from './pages/admin/UserDetail'
import AdminStoresList from './pages/admin/StoresList'
import AdminChangePassword from './pages/admin/ChangePassword'

import UserStoresList from './pages/user/StoresList'
import UserChangePassword from './pages/user/ChangePassword'

import OwnerDashboard from './pages/owner/Dashboard'
import OwnerChangePassword from './pages/owner/ChangePassword'

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
  if (user?.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />
  return <Navigate to="/stores" replace />
}

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><AdminUsersList /></ProtectedRoute>
        } />
        <Route path="/admin/users/:id" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><AdminUserDetail /></ProtectedRoute>
        } />
        <Route path="/admin/stores" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><AdminStoresList /></ProtectedRoute>
        } />
        <Route path="/admin/change-password" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><AdminChangePassword /></ProtectedRoute>
        } />

        {/* Normal user routes */}
        <Route path="/stores" element={
          <ProtectedRoute allowedRoles={['USER']}><UserStoresList /></ProtectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectedRoute allowedRoles={['USER']}><UserChangePassword /></ProtectedRoute>
        } />

        {/* Store owner routes */}
        <Route path="/owner/dashboard" element={
          <ProtectedRoute allowedRoles={['STORE_OWNER']}><OwnerDashboard /></ProtectedRoute>
        } />
        <Route path="/owner/change-password" element={
          <ProtectedRoute allowedRoles={['STORE_OWNER']}><OwnerChangePassword /></ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
