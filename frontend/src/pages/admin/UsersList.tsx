import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  address: string | null
  role: 'ADMIN' | 'USER' | 'STORE_OWNER'
  created_at: string
}

const ROLE_OPTS = ['', 'ADMIN', 'USER', 'STORE_OWNER']
const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  USER: 'bg-indigo-100 text-indigo-700',
  STORE_OWNER: 'bg-emerald-100 text-emerald-700',
}
const ROLE_STYLE: Record<string, string> = {
  ADMIN: 'bg-red-50 text-red-700 border-red-100',
  USER: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  STORE_OWNER: 'bg-emerald-50 text-emerald-700 border-emerald-100',
}

const AdminUsersList = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [addOpen, setAddOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    const params: Record<string, string> = { sortBy: sortField, order: sortOrder }
    if (name) params.name = name
    if (email) params.email = email
    if (address) params.address = address
    if (roleFilter) params.role = roleFilter
    api.get('/admin/users', { params })
      .then(res => setUsers(res.data.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [name, email, address, roleFilter, sortField, sortOrder])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const toggleSort = (field: string) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortOrder('asc') }
  }

  const SortBtn = ({ field }: { field: string }) => (
    <span className={`ml-1 text-[10px] ${sortField === field ? 'text-indigo-500' : 'text-gray-300'}`}>
      {sortField === field ? (sortOrder === 'asc' ? '▲' : '▼') : '▲▼'}
    </span>
  )

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Admin / Users</p>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <FilterInput id="f-name" placeholder="Search name…" value={name} onChange={setName} />
            <FilterInput id="f-email" placeholder="Search email…" value={email} onChange={setEmail} />
            <FilterInput id="f-address" placeholder="Search address…" value={address} onChange={setAddress} />
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 transition-colors bg-white cursor-pointer"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              {ROLE_OPTS.map(r => <option key={r} value={r}>{r || 'All Roles'}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {[['name', 'Name'], ['email', 'Email'], ['address', 'Address'], ['role', 'Role'], ['created_at', 'Joined']].map(([f, l]) => (
                    <th
                      key={f}
                      onClick={() => toggleSort(f)}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none whitespace-nowrap transition-colors"
                    >
                      {l}<SortBtn field={f} />
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-32" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-44" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-36" /></td>
                        <td className="px-5 py-4"><div className="h-5 bg-gray-100 rounded-full animate-pulse w-20" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-20" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-20 ml-auto" /></td>
                      </tr>
                    ))}
                  </>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500">No users found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-500'}`}>
                          {u.name.trim().split(/\s+/).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs max-w-[160px] truncate">{u.address || <span className="italic">—</span>}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${ROLE_STYLE[u.role] ?? 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          title="View details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setEditUser(u)}
                          title="Edit user"
                          aria-label={`Edit ${u.name}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteUser(u)}
                          title="Delete user"
                          aria-label={`Delete ${u.name}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && users.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">{users.length} {users.length === 1 ? 'user' : 'users'} found</p>
              <p className="text-xs text-gray-300">Click a column header to sort</p>
            </div>
          )}
        </div>
      </div>

      {addOpen && <AddUserModal onClose={() => setAddOpen(false)} onCreated={fetchUsers} />}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onUpdated={fetchUsers} />}
      {deleteUser && <DeleteUserModal user={deleteUser} onClose={() => setDeleteUser(null)} onDeleted={fetchUsers} />}
    </AdminLayout>
  )
}

/* ─── Filter input ─── */
const FilterInput = ({ id, placeholder, value, onChange }: {
  id: string; placeholder: string; value: string; onChange: (v: string) => void
}) => (
  <input
    id={id}
    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 transition-colors"
    placeholder={placeholder}
    value={value}
    onChange={e => onChange(e.target.value)}
  />
)

/* ─── Field wrapper ─── */
const Field = ({ id, label, hint, error, children }: {
  id: string; label: string; hint?: string; error?: string; children: React.ReactNode
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
    {hint && !error && <p className="text-gray-400 text-xs mt-1.5">{hint}</p>}
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
)

const inputCls = (hasErr: boolean) =>
  `w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${hasErr ? 'border-red-400 bg-red-50/40' : 'border-gray-200 hover:border-gray-300'}`

/* ─── Add User modal ─── */
interface AddUserModalProps { onClose: () => void; onCreated: () => void }

const AddUserModal = ({ onClose, onCreated }: AddUserModalProps) => {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'USER' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.name.trim().length < 20 || form.name.trim().length > 60) e.name = 'Name must be 20–60 characters'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
    const pw: string[] = []
    if (form.password.length < 8 || form.password.length > 16) pw.push('8–16 characters')
    if (!/[A-Z]/.test(form.password)) pw.push('one uppercase letter')
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password)) pw.push('one special character')
    if (pw.length) e.password = `Password needs: ${pw.join(', ')}`
    return e
  }

  const handleSubmit = async (ev: { preventDefault(): void }) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await api.post('/admin/users', form)
      toast.success('User created')
      onCreated(); onClose()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      toast.error(error.response?.data?.error || 'Failed to create user')
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Add New User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Field id="m-name" label="Full Name" hint="20–60 characters" error={errors.name}>
          <input id="m-name" className={inputCls(!!errors.name)} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </Field>
        <Field id="m-email" label="Email" error={errors.email}>
          <input id="m-email" type="email" className={inputCls(!!errors.email)} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </Field>
        <Field id="m-addr" label="Address (optional)">
          <input id="m-addr" className={inputCls(false)} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </Field>
        <Field id="m-pw" label="Password" hint="8–16 chars · uppercase · special char" error={errors.password}>
          <div className="relative">
            <input id="m-pw" type={showPw ? 'text' : 'password'} className={`${inputCls(!!errors.password)} pr-14`}
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600">
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>
        <Field id="m-role" label="Role">
          <select id="m-role" className={`${inputCls(false)} cursor-pointer`} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </Field>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ─── Edit User modal ─── */
interface EditUserModalProps { user: User; onClose: () => void; onUpdated: () => void }

const EditUserModal = ({ user, onClose, onUpdated }: EditUserModalProps) => {
  const [form, setForm] = useState({ name: user.name, email: user.email, address: user.address ?? '', role: user.role })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.name.trim().length < 20 || form.name.trim().length > 60) e.name = 'Name must be 20–60 characters'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
    return e
  }

  const handleSubmit = async (ev: { preventDefault(): void }) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await api.patch(`/admin/users/${user.id}`, {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim() || null,
        role: form.role,
      })
      toast.success('User updated')
      onUpdated(); onClose()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      toast.error(error.response?.data?.error || 'Failed to update user')
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Edit User" subtitle={user.name} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Field id="e-name" label="Full Name" hint="20–60 characters" error={errors.name}>
          <input id="e-name" className={inputCls(!!errors.name)} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </Field>
        <Field id="e-email" label="Email" error={errors.email}>
          <input id="e-email" type="email" className={inputCls(!!errors.email)} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </Field>
        <Field id="e-addr" label="Address (optional)">
          <input id="e-addr" className={inputCls(false)} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </Field>
        <Field id="e-role" label="Role">
          <select id="e-role" className={`${inputCls(false)} cursor-pointer`} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </Field>
        <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
          Password change is done via the Change Password page, not here.
        </p>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ─── Delete User modal ─── */
interface DeleteUserModalProps { user: User; onClose: () => void; onDeleted: () => void }

const DeleteUserModal = ({ user, onClose, onDeleted }: DeleteUserModalProps) => {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await api.delete(`/admin/users/${user.id}`)
      toast.success(`"${user.name}" deleted`)
      onDeleted(); onClose()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      toast.error(error.response?.data?.error || 'Failed to delete user')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 bg-red-50 border-b border-red-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Delete User?</h2>
            <p className="text-xs text-red-500 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">
            You're about to permanently delete{' '}
            <span className="font-semibold text-gray-900">"{user.name}"</span>{' '}
            and all their ratings.
            {user.role === 'STORE_OWNER' && (
              <span className="block mt-1 text-amber-600 text-xs">Their store will be unassigned but not deleted.</span>
            )}
          </p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleDelete} disabled={loading}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Deleting…' : 'Delete User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Modal shell ─── */
const Modal = ({ title, subtitle, onClose, children }: {
  title: string; subtitle?: string; onClose: () => void; children: React.ReactNode
}) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 px-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px]">{subtitle}</p>}
        </div>
        <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  </div>
)

export default AdminUsersList
