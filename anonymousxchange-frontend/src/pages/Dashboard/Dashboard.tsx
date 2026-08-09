import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  CheckCircle2,
  Wallet,
  MessageCircle,
  FileText,
  ChevronRight,
  TrendingUp,
  History,
} from 'lucide-react'
import { transactionsApi } from '../../api/transactions'
import { ratesApi } from '../../api/rates'
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
}

interface Stats {
  active: number
  completed: number
  volume: number
}

interface RateItem {
  asset: string
  type: string
  buyRate?: number | null
  sellRate?: number | null
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
  const [rates, setRates] = useState<RateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [txRes, ratesRes] = await Promise.all([
          transactionsApi.getAll(),
          ratesApi.getAll().catch(() => ({ data: [] })),
        ])
        const payload = txRes.data?.data ?? txRes.data
        setItems(payload?.items ?? [])
        setStats(payload?.stats ?? { active: 0, completed: 0, volume: 0 })
        const r = ratesRes.data?.data ?? ratesRes.data ?? []
        setRates(Array.isArray(r) ? r : [])
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

  const filtered = useMemo(() => {
    if (filter === 'active') {
      return items.filter((t) => !['completed', 'failed', 'cancelled'].includes(t.status))
    }
    if (filter === 'completed') {
      return items.filter((t) => t.status === 'completed')
    }
    return items
  }, [items, filter])

  const recent = items.slice(0, 5)

  const trending = useMemo(() => {
    // Prefer assets that appear in user history, else top rates
    const counts = new Map<string, number>()
    for (const t of items) counts.set(t.asset, (counts.get(t.asset) || 0) + 1)
    const fromHistory = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([asset]) => asset)
    if (fromHistory.length >= 3) return fromHistory.slice(0, 6)
    return rates.slice(0, 6).map((r) => r.asset)
  }, [items, rates])

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
          <p className="mt-1 text-slate-400">History, recent activity, and trending assets.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/account" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
            Profile settings
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
            <MessageCircle className="h-4 w-4" /> New trade
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Activity className="h-4 w-4 text-blue-400" /> Active
          </div>
          <p className="mt-1 text-3xl font-bold text-white">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Completed
          </div>
          <p className="mt-1 text-3xl font-bold text-emerald-400">{stats.completed}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Wallet className="h-4 w-4" /> Volume (₦)
          </div>
          <p className="mt-1 text-3xl font-bold text-white">
            {stats.volume ? stats.volume.toLocaleString() : '—'}
          </p>
        </div>
      </div>

      {/* Trending + Recent */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h2 className="font-semibold text-white">Trending</h2>
          </div>
          {trending.length === 0 ? (
            <p className="text-sm text-slate-500">Trade to see trending assets.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {trending.map((asset) => {
                const rate = rates.find((r) => r.asset === asset)
                return (
                  <div
                    key={asset}
                    className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-white">{asset}</span>
                    {rate && (
                      <span className="ml-2 text-xs text-slate-400">
                        Buy ₦{Number(rate.buyRate ?? 0).toLocaleString()} · Sell ₦
                        {Number(rate.sellRate ?? 0).toLocaleString()}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            <h2 className="font-semibold text-white">Recent transactions</h2>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500">No recent activity.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">
                    {tx.type.replace(/_/g, ' ')} · {tx.asset}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Transaction history</h2>
            <div className="flex gap-1 rounded-lg border border-white/10 p-1 text-xs">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-3 py-1 capitalize ${
                    filter === f ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-3 text-slate-400">No transactions yet.</p>
              <Link to="/" className="mt-4 inline-block text-sm font-medium text-blue-400">
                Open chat →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((tx) => (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => setSelected(tx)}
                  className="flex w-full flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-blue-500/30"
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
                  <FileText className="h-3.5 w-3.5" /> Receipt
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
        <Receipt data={selected as ReceiptData} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  )
}
