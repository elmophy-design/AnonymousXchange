import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAppDispatch } from '../../store/hooks'
import { setCredentials, setLoading } from '../../store/slices/authSlice'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: Record<string, unknown>) => void
          renderButton: (el: HTMLElement, cfg: Record<string, unknown>) => void
        }
      }
    }
  }
}

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [needs2FA, setNeeds2FA] = useState(false)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const finishLogin = (payload: Record<string, unknown>) => {
    const user = (payload?.user ?? payload) as Record<string, unknown>
    const accessToken = (payload?.accessToken ?? payload?.token) as string
    const refreshToken = payload?.refreshToken as string | undefined
    if (!accessToken) throw new Error('Invalid response from server')
    dispatch(
      setCredentials({
        user: {
          id: String(user?.id ?? 'unknown'),
          email: (user?.email as string) ?? email,
          firstName: user?.firstName as string | undefined,
          lastName: user?.lastName as string | undefined,
          role: user?.role as string | undefined,
          twoFactorEnabled: user?.twoFactorEnabled as boolean | undefined,
          avatarUrl: user?.avatarUrl as string | undefined,
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
      if (needs2FA && pendingUserId) {
        const { data } = await authApi.verify2FA(pendingUserId, totpCode)
        finishLogin(data?.data ?? data)
        return
      }
      const { data } = await authApi.login({
        email: email.trim(),
        password,
        totpCode: totpCode || undefined,
      })
      const payload = data?.data ?? data
      if (payload?.requires2FA) {
        setNeeds2FA(true)
        if (payload.tempUserId) setPendingUserId(payload.tempUserId)
        setError(null)
        return
      }
      finishLogin(payload)
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Unable to sign in.'
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
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (res: { credential?: string }) => {
          if (!res.credential) return
          setSubmitting(true)
          setError(null)
          try {
            const { data } = await authApi.google(res.credential)
            const payload = data?.data ?? data
            if (payload?.requires2FA && payload.tempUserId) {
              setNeeds2FA(true)
              setPendingUserId(payload.tempUserId)
              return
            }
            finishLogin(payload)
          } catch (err: unknown) {
            setError(
              (err as { response?: { data?: { message?: string } } })?.response?.data
                ?.message || 'Google sign-in failed'
            )
          } finally {
            setSubmitting(false)
          }
        },
      })
      const el = document.getElementById('google-btn')
      if (el) {
        window.google?.accounts.id.renderButton(el, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
        })
      }
    }
    document.body.appendChild(script)
    return () => {
      script.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block text-2xl font-bold text-white">
            Anonymous<span className="text-blue-400">X</span>change
          </Link>
          <p className="mt-2 text-sm text-slate-400">Sign in to buy &amp; sell gift cards and crypto</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          {!needs2FA ? (
            <>
              <div>
                <label className="text-xs text-slate-400">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400">Password</label>
                  <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs text-slate-400">Authenticator code</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm tracking-widest text-white outline-none focus:border-blue-500/40"
                placeholder="000000"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Please wait…' : needs2FA ? 'Verify & sign in' : 'Sign in'}
          </button>
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <>
              <div className="relative py-2 text-center text-xs text-slate-500">
                <span className="bg-transparent px-2">or</span>
              </div>
              <div id="google-btn" className="flex justify-center" />
            </>
          )}
          <p className="text-center text-sm text-slate-400">
            No account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
