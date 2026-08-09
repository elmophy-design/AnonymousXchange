import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, CheckCircle2, Wallet, MessageCircle, FileText, ChevronRight } from 'lucide-react'
import { transactionsApi } from '../../api/transactions'
import { useAppSelector } from '../../store/hooks'
import Receipt, { ReceiptData } from '../../components/dashboard/Receipt/Receipt'
import Timeline from '../../components/dashboard/Timeline/Timeline'

interface Transaction {
  id: string
  type: string
  asset: string
  amount: number | null
  rate?: number | null
  fee?: number | null
  payoutAmount: number | null
  currency?: string | null
  status: string
  reference: string | null
  createdAt: string
  updatedAt?: string
  notes?: string | null
  details?: Record<string, unknown> | null
}

interface Stats {
  active: number
  completed: number
  volume: number
}

const statusColor: Record<string, string> = {
  initiated: 'bg-slate-500/20 text-slate-300',
  awaiting_details: 'bg-amber-500/20 text-amber-300',
  pending_payment: 'bg-blue-500/20 text-blue-300',
  processing: 'bg-indigo-500/20 text-indigo-300',
  completed: 'bg-emerald-500/20 text-emerald-300',
  failed: 'bg-red-500/20 text-red-300',
  cancelled: 'bg-slate-500/20 text-slate-400',
}

export default function Dashboard() {
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const [items, setItems] = useState<Transaction[]>([])
  const [stats, setStats] = useState<Stats>({ active: 0, completed: 0, volume: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await transactionsApi.getAll()
        const payload = data?.data ?? data
        setItems(payload?.items ?? [])
        setStats(payload?.stats ?? { active: 0, completed: 0, volume: 0 })
      } catch (err: unknown) {
        setError(
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || 'Failed to load transactions'
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-slate-400">Log in to view your transactions.</p>
        <Link to="/login" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
          Log in →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-slate-400">Track trades and download receipts.</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          <MessageCircle className="h-4 w-4" />
          New trade
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Activity className="h-4 w-4 text-blue-400" /> Active
          </div>
          <p className="mt-1 text-3xl font-bold text-white">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Completed
          </div>
          <p className="mt-1 text-3xl font-bold text-emerald-400">{stats.completed}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Wallet className="h-4 w-4" /> Total volume (₦)
          </div>
          <p className="mt-1 text-3xl font-bold text-white">
            {stats.volume ? stats.volume.toLocaleString() : '—'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent transactions</h2>
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-3 text-slate-400">No transactions yet.</p>
              <Link to="/" className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300">
                Open chat →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((tx) => (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => setSelected(tx)}
                  className="flex w-full flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left backdrop-blur transition hover:border-blue-500/30 hover:bg-white/[0.07]"
                >
                  <div>
                    <p className="font-medium text-white">
                      {tx.type.replace(/_/g, ' ')} · {tx.asset}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {tx.reference} · {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {tx.payoutAmount != null && (
                      <span className="text-sm font-semibold text-slate-200">
                        ₦{Number(tx.payoutAmount).toLocaleString()}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        statusColor[tx.status] || statusColor.initiated
                      }`}
                    >
                      {tx.status.replace(/_/g, ' ')}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">Transaction detail</h3>
                <button
                  type="button"
                  onClick={() => setShowReceipt(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Receipt
                </button>
              </div>
              <p className="text-sm text-slate-400">
                {selected.type.replace(/_/g, ' ')} · {selected.asset}
              </p>
              <p className="mt-1 text-xs text-slate-500">{selected.reference}</p>
              <div className="mt-6">
                <Timeline
                  status={selected.status}
                  createdAt={selected.createdAt}
                  updatedAt={selected.updatedAt}
                  notes={selected.notes}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
              Select a transaction to view its timeline
            </div>
          )}
        </div>
      </div>

      {showReceipt && selected && (
        <Receipt
          data={selected as ReceiptData}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  )
}
