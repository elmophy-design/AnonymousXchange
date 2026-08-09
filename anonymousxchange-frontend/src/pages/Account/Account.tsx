import { useEffect, useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { User, Lock, Link2, Save, Loader2 } from 'lucide-react'
import { useAppSelector } from '../../store/hooks'
import apiClient from '../../api/client'

interface Profile {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  isVerified?: boolean
  role?: string
  createdAt?: string
}

interface ChannelLink {
  id: string
  channel: string
  externalId: string
  createdAt: string
}

export default function Account() {
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [channels, setChannels] = useState<ChannelLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    const load = async () => {
      try {
        const [meRes, chRes] = await Promise.all([
          apiClient.get('/users/me'),
          apiClient.get('/users/me/channels').catch(() => ({ data: { data: [] } })),
        ])
        const user = meRes.data?.data ?? meRes.data
        setProfile(user)
        setFirstName(user.firstName || '')
        setLastName(user.lastName || '')
        setChannels(chRes.data?.data ?? [])
      } catch {
        setMsg({ type: 'err', text: 'Failed to load profile' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAuthenticated])

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      const { data } = await apiClient.patch('/users/me', { firstName, lastName })
      setProfile(data?.data ?? data)
      setMsg({ type: 'ok', text: 'Profile updated' })
    } catch (err: unknown) {
      setMsg({
        type: 'err',
        text:
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || 'Update failed',
      })
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'err', text: 'Passwords do not match' })
      return
    }
    if (newPassword.length < 8) {
      setMsg({ type: 'err', text: 'Password must be at least 8 characters' })
      return
    }
    setSaving(true)
    setMsg(null)
    try {
      await apiClient.post('/users/me/password', {
        currentPassword,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMsg({ type: 'ok', text: 'Password changed successfully' })
    } catch (err: unknown) {
      setMsg({
        type: 'err',
        text:
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || 'Password change failed',
      })
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-400">Please log in to manage your account.</p>
        <Link to="/login" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
          Log in →
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white">Account</h1>
      <p className="mt-1 text-slate-400">Manage your profile, security, and linked channels.</p>

      {msg && (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            msg.type === 'ok'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Profile */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold text-white">Profile</h2>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Email</label>
            <p className="mt-1 text-sm text-white">{profile?.email}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-400">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save profile
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold text-white">Change password</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-400">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            Update password
          </button>
        </form>
      </section>

      {/* Linked channels */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold text-white">Linked channels</h2>
        </div>
        {channels.length === 0 ? (
          <p className="text-sm text-slate-400">
            No channels linked yet. Start a chat on Telegram or WhatsApp and link your account
            from the assistant, or contact support.
          </p>
        ) : (
          <ul className="space-y-2">
            {channels.map((ch) => (
              <li
                key={ch.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium capitalize text-white">{ch.channel}</p>
                  <p className="text-xs text-slate-500">{ch.externalId}</p>
                </div>
                <span className="text-xs text-emerald-400">Connected</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
