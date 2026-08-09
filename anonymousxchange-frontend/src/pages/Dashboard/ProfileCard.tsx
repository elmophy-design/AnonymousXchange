import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setCredentials } from '../../store/slices/authSlice'
import { usersApi } from '../../api/users'
import { UserCircle2, Mail, Sparkles } from 'lucide-react'

export default function ProfileCard() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [preferredChannel, setPreferredChannel] = useState(user?.preferredChannel ?? 'web')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setFirstName(user?.firstName ?? '')
    setLastName(user?.lastName ?? '')
    setPreferredChannel(user?.preferredChannel ?? 'web')
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const { data } = await usersApi.updateMe({
        firstName,
        lastName,
        preferredChannel,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      })
      const profile = data?.data ?? data
      dispatch(
        setCredentials({
          user: {
            id: profile?.id ?? user?.id ?? 'unknown',
            email: profile?.email ?? user?.email,
            firstName: profile?.firstName ?? firstName,
            lastName: profile?.lastName ?? lastName,
            preferredChannel: profile?.preferredChannel ?? preferredChannel,
            role: profile?.role ?? user?.role,
          },
          accessToken: localStorage.getItem('accessToken') || '',
          refreshToken: localStorage.getItem('refreshToken') || undefined,
        })
      )
      setCurrentPassword('')
      setNewPassword('')
      setMessage('Profile updated successfully.')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Unable to update profile.'
      setMessage(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-400">Account profile</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Keep your details up to date</h2>
        </div>
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2 text-blue-300">
          <UserCircle2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">
              <span className="mb-2 block">First name</span>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/50"
              />
            </label>
            <label className="text-sm text-slate-300">
              <span className="mb-2 block">Last name</span>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/50"
              />
            </label>
          </div>

          <label className="text-sm text-slate-300">
            <span className="mb-2 block">Preferred channel</span>
            <select
              value={preferredChannel}
              onChange={(e) => setPreferredChannel(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/50"
            >
              <option value="web">Web</option>
              <option value="telegram">Telegram</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">
              <span className="mb-2 block">Current password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/50"
                placeholder="••••••••"
              />
            </label>
            <label className="text-sm text-slate-300">
              <span className="mb-2 block">New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/50"
                placeholder="••••••••"
              />
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>

          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Mail className="h-4 w-4 text-blue-400" /> Email
          </div>
          <p className="mt-2 text-white">{user?.email || 'No email on file'}</p>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            <Sparkles className="h-4 w-4" />
            Your account is ready for faster follow-up on future deals.
          </div>
        </div>
      </div>
    </div>
  )
}
