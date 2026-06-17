import React, { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { StarRatingDisplay } from '../../components/StarRating'
import api from '../../api/axios'
import toast from 'react-hot-toast'

interface Store {
  id: string
  name: string
  email: string
  address: string | null
  owner_id: string | null
  owner_name: string | null
  average_rating: number | null
  created_at: string
}

interface StoreOwner { id: string; name: string; email: string }

const AdminStoresList = () => {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [addOpen, setAddOpen] = useState(false)
  const [editStore, setEditStore] = useState<Store | null>(null)
  const [deleteStore, setDeleteStore] = useState<Store | null>(null)

  const fetchStores = useCallback(() => {
    setLoading(true)
    const params: Record<string, string> = { sortBy: sortField, order: sortOrder }
    if (name) params.name = name
    if (email) params.email = email
    if (address) params.address = address
    api.get('/admin/stores', { params })
      .then(res => setStores(res.data.data))
      .catch(() => toast.error('Failed to load stores'))
      .finally(() => setLoading(false))
  }, [name, email, address, sortField, sortOrder])

  useEffect(() => { fetchStores() }, [fetchStores])

  const toggleSort = (field: string) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortOrder('asc') }
  }

  const SortBtn = ({ field }: { field: string }) => (
    <span className={`ml-1 text-[10px] ${sortField === field ? 'text-indigo-500' : 'text-gray-300'}`}>
      {sortField === field ? (sortOrder === 'asc' ? '▲' : '▼') : '▲▼'}
    </span>
  )

  const columns: [string, string][] = [
    ['name', 'Store Name'],
    ['email', 'Email'],
    ['address', 'Address'],
    ['owner_name', 'Owner'],
    ['average_rating', 'Rating'],
  ]

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Admin / Stores</p>
            <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Store
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FilterInput id="fs-name" placeholder="Search name…" value={name} onChange={setName} />
            <FilterInput id="fs-email" placeholder="Search email…" value={email} onChange={setEmail} />
            <FilterInput id="fs-addr" placeholder="Search address…" value={address} onChange={setAddress} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {columns.map(([f, l]) => (
                    <th
                      key={f}
                      onClick={() => toggleSort(f)}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none whitespace-nowrap transition-colors"
                    >
                      {l}<SortBtn field={f} />
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-32" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-40" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-28" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-24" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-20" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-14 ml-auto" /></td>
                      </tr>
                    ))}
                  </>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500">No stores found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or add a new store</p>
                    </td>
                  </tr>
                ) : stores.map(s => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-5 py-4 font-semibold text-gray-800 whitespace-nowrap">{s.name}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{s.email}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs max-w-[160px] truncate">{s.address || <span className="italic">—</span>}</td>
                    <td className="px-5 py-4">
                      {s.owner_name
                        ? <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                              {s.owner_name.charAt(0)}
                            </span>
                            {s.owner_name}
                          </span>
                        : <span className="text-xs text-gray-300 italic">Unassigned</span>}
                    </td>
                    <td className="px-5 py-4">
                      {s.average_rating != null
                        ? <StarRatingDisplay value={s.average_rating} size="sm" />
                        : <span className="text-gray-300 text-xs italic">No ratings</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditStore(s)}
                          title="Edit store"
                          aria-label={`Edit ${s.name}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteStore(s)}
                          title="Delete store"
                          aria-label={`Delete ${s.name}`}
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
          {!loading && stores.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {stores.length} {stores.length === 1 ? 'store' : 'stores'} found
              </p>
              <p className="text-xs text-gray-300">Click a column header to sort</p>
            </div>
          )}
        </div>
      </div>

      {addOpen && (
        <StoreModal mode="add" onClose={() => setAddOpen(false)} onDone={fetchStores} />
      )}
      {editStore && (
        <StoreModal mode="edit" store={editStore} onClose={() => setEditStore(null)} onDone={fetchStores} />
      )}
      {deleteStore && (
        <DeleteConfirmModal store={deleteStore} onClose={() => setDeleteStore(null)} onDone={fetchStores} />
      )}
    </AdminLayout>
  )
}

/* ─────────────────────────────────────────── */
/*  Shared filter input                         */
/* ─────────────────────────────────────────── */

const FilterInput = ({ id, placeholder, value, onChange }: {
  id: string; placeholder: string; value: string; onChange: (v: string) => void
}) => (
  <input
    id={id}
    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 transition-colors"
    placeholder={placeholder}
    value={value}
    onChange={e => onChange(e.target.value)}
  />
)

/* ─────────────────────────────────────────── */
/*  Add / Edit modal (shared)                   */
/* ─────────────────────────────────────────── */

interface StoreModalProps {
  mode: 'add' | 'edit'
  store?: Store
  onClose: () => void
  onDone: () => void
}

const StoreModal = ({ mode, store, onClose, onDone }: StoreModalProps) => {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState({
    name: store?.name ?? '',
    email: store?.email ?? '',
    address: store?.address ?? '',
    owner_id: store?.owner_id ?? '',
  })
  const [owners, setOwners] = useState<StoreOwner[]>([])
  const [assignedOwnerIds, setAssignedOwnerIds] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/admin/users', { params: { role: 'STORE_OWNER', sortBy: 'name', order: 'asc' } })
      .then(res => setOwners(res.data.data))
      .catch(() => {})

    api.get('/admin/stores')
      .then(res => {
        const assigned = new Set<string>()
        for (const s of res.data.data as { id: string; owner_id: string | null }[]) {
          if (s.owner_id && s.id !== store?.id) assigned.add(s.owner_id)
        }
        setAssignedOwnerIds(assigned)
      })
      .catch(() => {})
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Store name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    return e
  }

  const handleSubmit = async (ev: { preventDefault(): void }) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const payload: Record<string, string | null> = {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim() || null,
        owner_id: form.owner_id || null,
      }
      if (isEdit && store) {
        await api.patch(`/admin/stores/${store.id}`, payload)
        toast.success('Store updated')
      } else {
        await api.post('/admin/stores', payload)
        toast.success('Store created')
      }
      onDone(); onClose()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      toast.error(error.response?.data?.error || (isEdit ? 'Failed to update store' : 'Failed to create store'))
    } finally { setLoading(false) }
  }

  const inputCls = (hasErr: boolean) =>
    `w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${hasErr ? 'border-red-400 bg-red-50/40' : 'border-gray-200 hover:border-gray-300'}`

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? 'Edit Store' : 'Add New Store'}
            </h2>
            {isEdit && store && (
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px]">{store.name}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField id="ss-name" label="Store Name" error={errors.name}>
            <input
              id="ss-name"
              className={inputCls(!!errors.name)}
              placeholder="e.g. City Electronics"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </FormField>

          <FormField id="ss-email" label="Email" error={errors.email}>
            <input
              id="ss-email"
              type="email"
              className={inputCls(!!errors.email)}
              placeholder="store@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </FormField>

          <FormField id="ss-addr" label="Address (optional)">
            <input
              id="ss-addr"
              className={inputCls(false)}
              placeholder="123 Main St, City"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            />
          </FormField>

          <FormField id="ss-owner" label="Assign Owner (optional)">
            <select
              id="ss-owner"
              className={`${inputCls(false)} cursor-pointer`}
              value={form.owner_id}
              onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))}
            >
              <option value="">No owner</option>
              {owners.map(o => {
                const disabled = assignedOwnerIds.has(o.id)
                return (
                  <option key={o.id} value={o.id} disabled={disabled}>
                    {o.name} ({o.email}){disabled ? ' — already assigned' : ''}
                  </option>
                )
              })}
            </select>
          </FormField>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading
                ? (isEdit ? 'Saving…' : 'Creating…')
                : (isEdit ? 'Save Changes' : 'Create Store')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────── */
/*  Delete confirmation modal                   */
/* ─────────────────────────────────────────── */

interface DeleteConfirmModalProps {
  store: Store
  onClose: () => void
  onDone: () => void
}

const DeleteConfirmModal = ({ store, onClose, onDone }: DeleteConfirmModalProps) => {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await api.delete(`/admin/stores/${store.id}`)
      toast.success(`"${store.name}" deleted`)
      onDone(); onClose()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      toast.error(error.response?.data?.error || 'Failed to delete store')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Danger header */}
        <div className="px-6 py-5 bg-red-50 border-b border-red-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Delete Store?</h2>
            <p className="text-xs text-red-500 mt-0.5">This action cannot be undone</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">
            You&apos;re about to permanently delete{' '}
            <span className="font-semibold text-gray-900">"{store.name}"</span>{' '}
            and all its ratings.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? 'Deleting…' : 'Delete Store'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────── */
/*  Form field wrapper                          */
/* ─────────────────────────────────────────── */

const FormField = ({ id, label, error, children }: {
  id: string; label: string; error?: string; children: React.ReactNode
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
)

export default AdminStoresList
