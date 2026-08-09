import { useState, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../../api/auth'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await authApi.resetPassword(token, password)
      setOk(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Reset failed'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Missing reset token. <Link className="ml-2 text-blue-400" to="/forgot-password">Request a new one</Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-bold text-white">Set new password</h1>
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40" />
        <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {ok && <p className="text-sm text-emerald-400">Password updated. Redirecting…</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
          {loading ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
