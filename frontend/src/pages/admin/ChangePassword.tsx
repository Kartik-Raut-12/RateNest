import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const AdminChangePassword = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.current) e.current = 'Current password is required'
    const pw: string[] = []
    if (form.next.length < 8 || form.next.length > 16) pw.push('8–16 characters')
    if (!/[A-Z]/.test(form.next)) pw.push('one uppercase letter')
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.next)) pw.push('one special character')
    if (pw.length) e.next = `Needs: ${pw.join(', ')}`
    if (form.next !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = (ev: { preventDefault(): void }) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setConfirming(true)
  }

  const confirmChange = async () => {
    setConfirming(false)
    setLoading(true)
    try {
      await api.patch('/auth/change-password', { currentPassword: form.current, newPassword: form.next })
      toast.success('Password changed successfully')
      navigate('/admin/dashboard')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; error?: string } } }
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to change password')
    } finally { setLoading(false) }
  }

  const strength = (() => {
    if (!form.next) return 0
    let s = 0
    if (form.next.length >= 8) s++
    if (form.next.length >= 12) s++
    if (/[A-Z]/.test(form.next)) s++
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.next)) s++
    return s
  })()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'][strength]

  return (
    <AdminLayout>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <div className="mb-7">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Account</p>
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
          <p className="text-sm text-gray-400 mt-1">Keep your admin account secure with a strong password.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <PwField
              id="ap-cur" label="Current Password"
              value={form.current} show={show.current}
              onToggle={() => setShow(s => ({ ...s, current: !s.current }))}
              onChange={v => setForm(f => ({ ...f, current: v }))}
              error={errors.current}
            />

            <div>
              <PwField
                id="ap-new" label="New Password"
                value={form.next} show={show.next}
                onToggle={() => setShow(s => ({ ...s, next: !s.next }))}
                onChange={v => setForm(f => ({ ...f, next: v }))}
                error={errors.next}
              />
              {form.next && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : 'bg-gray-100'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{strengthLabel} password</p>
                </div>
              )}
              {!errors.next && <p className="text-xs text-gray-400 mt-1.5">8–16 characters · uppercase · special character</p>}
            </div>

            <PwField
              id="ap-cfm" label="Confirm New Password"
              value={form.confirm} show={show.confirm}
              onToggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
              onChange={v => setForm(f => ({ ...f, confirm: v }))}
              error={errors.confirm}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          onCancel={() => setConfirming(false)}
          onConfirm={confirmChange}
        />
      )}
    </AdminLayout>
  )
}

interface PwFieldProps {
  id: string; label: string; value: string; show: boolean
  onToggle: () => void; onChange: (v: string) => void; error?: string
}

const PwField = ({ id, label, value, show, onToggle, onChange, error }: PwFieldProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        className={`w-full border rounded-xl px-4 py-2.5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${error ? 'border-red-400 bg-red-50/40' : 'border-gray-200 hover:border-gray-300'}`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={show ? 'Hide' : 'Show'}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
)

const ConfirmDialog = ({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1.5">Change password?</h3>
      <p className="text-sm text-gray-500 mb-6">This will update your password immediately. Make sure you remember it.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          Yes, change it
        </button>
      </div>
    </div>
  </div>
)

export default AdminChangePassword
