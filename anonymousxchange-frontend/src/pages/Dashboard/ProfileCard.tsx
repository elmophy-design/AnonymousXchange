import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { setCredentials } from '../../store/slices/authSlice'
import apiClient from '../../api/client'

const CHANNELS = [
  { value: 'web', label: 'Website' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

export default function ProfileCard() {
  const dispatch = useAppDispatch()
  const { user, accessToken } = useAppSelector((s) => s.auth)
  const [preferredChannel, setPreferredChannel] = useState(
    user?.preferredChannel || 'web'
  )
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  if (!user) return null

  const save = async () => {
    setSaving(true)
    setMsg(null)
    try {
      const { data } = await apiClient.patch('/users/me', { preferredChannel })
      const updated = data?.data ?? data
      if (accessToken) {
        dispatch(
          setCredentials({
            user: {
              ...user,
              preferredChannel: updated.preferredChannel ?? preferredChannel,
              firstName: updated.firstName ?? user.firstName,
              lastName: updated.lastName ?? user.lastName,
            },
            accessToken,
          })
        )
      }
      setMsg('Saved')
    } catch {
      setMsg('Could not save preference')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h3 className="font-semibold text-white">Profile</h3>
      <p className="mt-1 text-sm text-slate-400">
        {user.firstName || user.email || 'Trader'}
      </p>

      <label className="mt-4 block text-xs text-slate-400">Preferred channel</label>
      <select
        value={preferredChannel}
        onChange={(e) => setPreferredChannel(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/40"
      >
        {CHANNELS.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
      {msg && <p className="mt-2 text-xs text-slate-400">{msg}</p>}
    </div>
  )
}
