import { useEffect, useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { User, Lock, Link2, Save, Loader2, Shield } from 'lucide-react'
import { useAppSelector } from '../../store/hooks'
import apiClient from '../../api/client'
import { authApi } from '../../api/auth'

interface Profile {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  isVerified?: boolean
  role?: string
  preferredChannel?: string
  twoFactorEnabled?: boolean
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
  const [preferredChannel, setPreferredChannel] = useState('web')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [totpSetup, setTotpSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

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
        setPreferredChannel(user.preferredChannel || 'web')
        setTwoFactorEnabled(!!user.twoFactorEnabled)
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
      const { data } = await apiClient.patch('/users/me', {
        firstName,
        lastName,
        preferredChannel,
      })
      setProfile(data?.data ?? data)
      setMsg({ type: 'ok', text: 'Profile updated' })
    } catch (err: unknown) {
      setMsg({
        type: 'err',
        text:
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Update failed',
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
    setSaving(true)
    setMsg(null)
    try {
      await apiClient.post('/users/me/password', { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMsg({ type: 'ok', text: 'Password changed successfully' })
    } catch (err: unknown) {
      setMsg({
        type: 'err',
        text:
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Password change failed',
      })
    } finally {
      setSaving(false)
    }
  }

  const start2FA = async () => {
    setMsg(null)
    try {
      const { data } = await authApi.setup2FA()
      setTotpSetup(data?.data ?? data)
    } catch (err: unknown) {
      setMsg({
        type: 'err',
        text:
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not start 2FA setup',
      })
    }
  }

  const confirm2FA = async () => {
    setMsg(null)
    try {
      await authApi.enable2FA(totpCode)
      setTwoFactorEnabled(true)
      setTotpSetup(null)
      setTotpCode('')
      setMsg({ type: 'ok', text: 'Two-factor authentication enabled' })
    } catch (err: unknown) {
      setMsg({
        type: 'err',
        text:
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Invalid code',
      })
    }
  }

  const turnOff2FA = async () => {
    setMsg(null)
    try {
      await authApi.disable2FA(totpCode)
      setTwoFactorEnabled(false)
      setTotpCode('')
      setMsg({ type: 'ok', text: 'Two-factor authentication disabled' })
    } catch (err: unknown) {
      setMsg({
        type: 'err',
        text:
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not disable 2FA',
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-400">Please log in to manage your account.</p>
        <Link to="/login" className="mt-4 inline-block text-blue-400">Log in →</Link>
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
      <h1 className="text-2xl font-bold text-white">Account settings</h1>
      <p className="mt-1 text-slate-400">Profile, security, 2FA, and linked channels.</p>

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
            <label className="text-xs text-slate-400">Preferred channel</label>
            <select
              value={preferredChannel}
              onChange={(e) => setPreferredChannel(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40"
            >
              <option value="web">Website</option>
              <option value="telegram">Telegram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="discord">Discord</option>
            </select>
          </div>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save profile
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold text-white">Change password</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40" />
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40" />
          </div>
          <button type="submit" disabled={saving}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
            Update password
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold text-white">Two-factor authentication</h2>
        </div>
        <p className="text-sm text-slate-400">
          Status:{' '}
          <span className={twoFactorEnabled ? 'text-emerald-400' : 'text-slate-300'}>
            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </p>
        {!twoFactorEnabled && !totpSetup && (
          <button type="button" onClick={start2FA}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500">
            Set up authenticator app
          </button>
        )}
        {totpSetup && (
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-slate-400">
              Add this secret in Google Authenticator / Authy, then enter a code:
            </p>
            <code className="block break-all rounded-lg bg-black/40 px-3 py-2 text-emerald-300">
              {totpSetup.secret}
            </code>
            <p className="break-all text-xs text-slate-500">{totpSetup.otpauthUrl}</p>
            <input
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="6-digit code"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm tracking-widest text-white outline-none focus:border-blue-500/40"
            />
            <button type="button" onClick={confirm2FA}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500">
              Confirm & enable
            </button>
          </div>
        )}
        {twoFactorEnabled && (
          <div className="mt-4 space-y-3">
            <input
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="Code to disable 2FA"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm tracking-widest text-white outline-none focus:border-blue-500/40"
            />
            <button type="button" onClick={turnOff2FA}
              className="rounded-xl border border-red-500/40 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/10">
              Disable 2FA
            </button>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold text-white">Linked channels</h2>
        </div>
        {channels.length === 0 ? (
          <p className="text-sm text-slate-400">
            No channels linked yet. Connect Telegram, WhatsApp, or Discord via the assistant.
          </p>
        ) : (
          <ul className="space-y-2">
            {channels.map((ch) => (
              <li key={ch.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
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
