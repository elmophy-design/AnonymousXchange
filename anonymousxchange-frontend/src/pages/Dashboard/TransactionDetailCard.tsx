import { useEffect, useState } from 'react'
import { ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react'
import { transactionsApi } from '../../api/transactions'

interface TransactionDetail {
  id: string
  type: string
  asset: string
  status: string
  reference: string | null
  payoutAmount: number | null
  createdAt: string
  notes: string | null
  details: Record<string, unknown> | null
}

export default function TransactionDetailCard() {
  const [tx, setTx] = useState<TransactionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await transactionsApi.getAll()
        const payload = data?.data ?? data
        const latest = payload?.items?.[0] ?? null
        setTx(latest)
      } catch {
        setTx(null)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Loading latest deal…</div>
  }

  if (!tx) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
        No deals yet. Start one from the home chat to see your progress here.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-400">Latest deal</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{tx.asset} · {tx.type.replace('_', ' ')}</h2>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm text-slate-300">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2">
          <span>Status</span>
          <span className="font-medium text-white capitalize">{tx.status.replace('_', ' ')}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2">
          <span>Reference</span>
          <span className="font-medium text-white">{tx.reference || '—'}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2">
          <span>Estimated payout</span>
          <span className="font-medium text-white">{tx.payoutAmount != null ? `₦${tx.payoutAmount.toLocaleString()}` : '—'}</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3">
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="h-4 w-4" /> Next step
          </div>
          <p className="mt-2 text-sm text-slate-300">
            {tx.notes || 'Our team will follow up with the next required step after you confirm the request.'}
          </p>
        </div>
      </div>

      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-400">
        Keep this deal moving <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  )
}
