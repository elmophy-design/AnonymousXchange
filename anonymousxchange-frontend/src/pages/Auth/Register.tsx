import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAppDispatch } from '../../store/hooks'
import { setCredentials, setLoading } from '../../store/slices/authSlice'

export default function Register() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const finish = (payload: Record<string, unknown>) => {
    const user = (payload?.user ?? payload) as Record<string, unknown>
    const accessToken = (payload?.accessToken ?? payload?.token) as string
    const refreshToken = payload?.refreshToken as string | undefined
    if (!accessToken) throw new Error('Invalid response')
    dispatch(
      setCredentials({
        user: {
          id: String(user?.id ?? 'unknown'),
          email: (user?.email as string) ?? email,
          firstName: user?.firstName as string | undefined,
          lastName: user?.lastName as string | undefined,
        },
        accessToken,
        refreshToken,
      })
    )
    navigate('/dashboard')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    dispatch(setLoading(true))
    try {
      const { data } = await authApi.register({
        email: email.trim(),
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      })
      finish(data?.data ?? data)
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Registration failed'
      )
    } finally {
      setSubmitting(false)
      dispatch(setLoading(false))
    }
  }

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      // @ts-expect-error GIS global
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (res: { credential?: string }) => {
          if (!res.credential) return
          try {
            const { data } = await authApi.google(res.credential)
            finish(data?.data ?? data)
          } catch (err: unknown) {
            setError(
              (err as { response?: { data?: { message?: string } } })?.response?.data
                ?.message || 'Google sign-up failed'
            )
          }
        },
      })
      const el = document.getElementById('google-btn-reg')
      // @ts-expect-error GIS global
      if (el) window.google?.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 320 })
    }
    document.body.appendChild(script)
    return () => { script.remove() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-white">
            Anonymous<span className="text-blue-400">X</span>change
          </Link>
          <p className="mt-2 text-sm text-slate-400">Create an account to buy &amp; sell</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-400">First name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Last name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40" />
          </div>
          <div>
            <label className="text-xs text-slate-400">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
            {submitting ? 'Creating…' : 'Create account'}
          </button>
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && <div id="google-btn-reg" className="flex justify-center pt-2" />}
          <p className="text-center text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-blue-400">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
