import { useEffect, useState } from 'react'
import { TrendingUp, RefreshCw } from 'lucide-react'
import { ratesApi } from '../../../api/rates'
import { Link } from 'react-router-dom'

interface RateItem {
  asset: string
  type: string
  buyRate?: number | null
  sellRate?: number | null
  currency?: string
}

export default function LiveRatesStrip() {
  const [rates, setRates] = useState<RateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = async () => {
    try {
      const { data } = await ratesApi.getAll()
      const payload = data?.data ?? data
      const items: RateItem[] = Array.isArray(payload)
        ? payload
        : payload?.items ?? payload?.rates ?? []
      setRates(items.slice(0, 8))
      setLastUpdated(new Date())
    } catch {
      // keep previous
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 60_000) // refresh every 60s
    return () => clearInterval(id)
  }, [])

  if (loading && rates.length === 0) {
    return (
      <div className="border-b border-white/5 bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 text-xs text-slate-500">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Loading live rates…
        </div>
      </div>
    )
  }

  if (rates.length === 0) return null

  return (
    <div className="border-b border-white/5 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-emerald-400">
          <TrendingUp className="h-3.5 w-3.5" />
          Live
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          {rates.map((r) => (
            <div
              key={`${r.asset}-${r.type}`}
              className="flex shrink-0 items-center gap-2 text-xs"
            >
              <span className="font-semibold text-white">{r.asset}</span>
              {r.sellRate != null && (
                <span className="text-slate-400">
                  Sell{' '}
                  <span className="text-slate-200">
                    ₦{Number(r.sellRate).toLocaleString()}
                  </span>
                </span>
              )}
              {r.buyRate != null && (
                <span className="text-slate-500">
                  Buy ₦{Number(r.buyRate).toLocaleString()}
                </span>
              )}
            </div>
          ))}
        </div>
        <Link
          to="/rates"
          className="ml-auto shrink-0 text-xs font-medium text-blue-400 hover:text-blue-300"
        >
          All rates →
        </Link>
        {lastUpdated && (
          <span className="hidden text-[10px] text-slate-600 sm:inline">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}
