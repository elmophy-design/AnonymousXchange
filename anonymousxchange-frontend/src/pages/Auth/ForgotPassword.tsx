import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../../api/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [devLink, setDevLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMsg(null)
    setDevLink(null)
    try {
      const { data } = await authApi.forgotPassword(email.trim())
      setMsg(data?.message || 'If that email exists, a reset link was sent.')
      const link = data?.data?.devResetLink
      if (link) setDevLink(link)
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Request failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-bold text-white">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-400">We’ll email you a reset link.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40" />
          {msg && <p className="text-sm text-emerald-400">{msg}</p>}
          {devLink && (
            <p className="break-all text-xs text-slate-400">
              Dev link: <Link className="text-blue-400" to={devLink.replace(/^https?:\/\/[^/]+/, '')}>{devLink}</Link>
            </p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/login" className="text-blue-400">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
