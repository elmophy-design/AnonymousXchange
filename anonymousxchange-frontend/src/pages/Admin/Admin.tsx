import { useEffect, useState } from 'react'
import { Shield, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import apiClient from '../../api/client'
import { useAppSelector } from '../../store/hooks'
import { Link } from 'react-router-dom'

interface AdminTx {
  id: string
  type: string
  asset: string
  status: string
  reference: string | null
  amount: number | null
  payoutAmount: number | null
  createdAt: string
  user?: { email?: string; firstName?: string }
}

export default function Admin() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const [items, setItems] = useState<AdminTx[]>([])
  const [stats, setStats] = useState({ users: 0, transactions: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [txRes, statsRes] = await Promise.all([
        apiClient.get('/admin/transactions'),
        apiClient.get('/admin/stats'),
      ])
      setItems(txRes.data?.data ?? [])
      setStats(statsRes.data?.data ?? { users: 0, transactions: 0, pending: 0 })
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to load admin data (admin role required)'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) load()
    else setLoading(false)
  }, [isAuthenticated])

  const setStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/admin/transactions/${id}/status`, { status })
      await load()
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Update failed'
      )
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Shield className="mx-auto h-10 w-10 text-slate-500" />
        <p className="mt-4 text-slate-400">Sign in as admin to continue.</p>
        <Link to="/login" className="mt-4 inline-block text-blue-400">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Admin</h1>
            <p className="text-sm text-slate-400">
              Approve transactions · {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Users', value: stats.users },
          { label: 'Transactions', value: stats.transactions },
          { label: 'Pending', value: stats.pending },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/10 bg-white/5 p-5"
          >
            <p className="text-sm text-slate-400">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
          <p className="mt-1 text-xs text-amber-200/70">
            Tip: set your user role to <code>admin</code> in the database (Prisma Studio).
          </p>
        </div>
      )}

      <div className="mt-10 space-y-3">
        {items.map((tx) => (
          <div
            key={tx.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4"
          >
            <div>
              <p className="font-medium text-white">
                {tx.type} · {tx.asset}
              </p>
              <p className="text-xs text-slate-500">
                {tx.reference} · {tx.user?.email || 'guest'} ·{' '}
                {new Date(tx.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-500/20 px-2.5 py-0.5 text-xs capitalize text-slate-300">
                {tx.status}
              </span>
              <button
                onClick={() => setStatus(tx.id, 'processing')}
                className="flex items-center gap-1 rounded-lg bg-blue-600/20 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-600/30"
              >
                <Clock className="h-3 w-3" /> Process
              </button>
              <button
                onClick={() => setStatus(tx.id, 'completed')}
                className="flex items-center gap-1 rounded-lg bg-emerald-600/20 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-600/30"
              >
                <CheckCircle className="h-3 w-3" /> Complete
              </button>
              <button
                onClick={() => setStatus(tx.id, 'failed')}
                className="flex items-center gap-1 rounded-lg bg-red-600/20 px-2.5 py-1 text-xs text-red-300 hover:bg-red-600/30"
              >
                <XCircle className="h-3 w-3" /> Fail
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && !error && (
          <p className="text-center text-slate-500">No transactions yet.</p>
        )}
      </div>
    </div>
  )
}
