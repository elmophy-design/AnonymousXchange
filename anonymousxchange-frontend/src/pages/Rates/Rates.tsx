import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightLeft, RefreshCw } from 'lucide-react'
import { ratesApi } from '../../api/rates'

interface Rate {
  asset: string
  type: string
  buyRate: number | null
  sellRate: number | null
  currency: string
  updatedAt?: string
}

function tradeUrl(asset: string, type: string, action: 'buy' | 'sell') {
  const kind = type === 'giftcard' ? `${asset} gift card` : asset
  const prompt =
    action === 'sell' ? `I want to sell ${kind}` : `I want to buy ${kind}`
  return `/?trade=${encodeURIComponent(prompt)}#trade`
}

export default function Rates() {
  const [rates, setRates] = useState<Rate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await ratesApi.getAll()
      const list = data?.data ?? data ?? []
      setRates(Array.isArray(list) ? list : [])
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to load rates'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [])

  const crypto = rates.filter((r) => r.type === 'crypto')
  const giftcards = rates.filter((r) => r.type === 'giftcard')
  const latestUpdate = rates
    .map((rate) => (rate.updatedAt ? new Date(rate.updatedAt).getTime() : 0))
    .filter(Boolean)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Rates</h1>
          <p className="mt-1 text-slate-400">
            Crypto from CoinGecko · Gift cards updated regularly
          </p>
          {latestUpdate.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              Last market update: {new Date(Math.max(...latestUpdate)).toLocaleString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && rates.length === 0 ? (
        <div className="mt-12 text-center text-slate-400">Loading rates…</div>
      ) : (
        <div className="mt-8 space-y-10">
          {crypto.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">Cryptocurrency</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {crypto.map((r) => (
                  <article
                    key={`${r.type}-${r.asset}`}
                    className="group relative flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-blue-500/40 hover:bg-blue-500/5 hover:shadow-lg hover:shadow-blue-500/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">{r.asset}</span>
                      <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] text-blue-300">
                        Crypto
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Buy</p>
                        <p className="font-semibold text-emerald-400">
                          ₦{r.buyRate?.toLocaleString() ?? '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Sell</p>
                        <p className="font-semibold text-amber-400">
                          ₦{r.sellRate?.toLocaleString() ?? '—'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex gap-2">
                      <Link
                        to={tradeUrl(r.asset, r.type, 'buy')}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                      >
                        Buy
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        to={tradeUrl(r.asset, r.type, 'sell')}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-600/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-500"
                      >
                        Sell
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {giftcards.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">
                Gift Cards (sell rate per $1)
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {giftcards.map((r) => (
                  <Link
                    key={`${r.type}-${r.asset}`}
                    to={tradeUrl(r.asset, r.type, 'sell')}
                    className="group block cursor-pointer rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:shadow-lg hover:shadow-indigo-500/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white group-hover:text-indigo-200">
                        {r.asset}
                      </span>
                      <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[11px] text-indigo-300">
                        Gift Card
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-amber-400">
                      ₦{r.sellRate?.toLocaleString() ?? '—'}
                    </p>
                    <p className="mt-3 text-xs font-medium text-indigo-300 opacity-80 transition group-hover:opacity-100">
                      Tap to sell →
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {rates.length === 0 && !loading && (
            <p className="text-center text-slate-400">No rates available yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
