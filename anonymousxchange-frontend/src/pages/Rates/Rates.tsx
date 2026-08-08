import { useEffect, useState } from 'react'
import { ratesApi } from '../../api/rates'

interface Rate {
  asset: string
  type: string
  buyRate: number | null
  sellRate: number | null
  currency: string
  updatedAt?: string
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
    const id = setInterval(load, 60000) // refresh every 60s
    return () => clearInterval(id)
  }, [])

  const crypto = rates.filter((r) => r.type === 'crypto')
  const giftcards = rates.filter((r) => r.type === 'giftcard')

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Rates</h1>
          <p className="mt-1 text-slate-400">
            Crypto from CoinGecko · Gift cards updated regularly
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
        >
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
                  <div
                    key={`${r.type}-${r.asset}`}
                    className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-blue-500/30"
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
                  </div>
                ))}
              </div>
            </section>
          )}

          {giftcards.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">Gift Cards (sell rate per $1)</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {giftcards.map((r) => (
                  <div
                    key={`${r.type}-${r.asset}`}
                    className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-indigo-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{r.asset}</span>
                      <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[11px] text-indigo-300">
                        Gift Card
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-amber-400">
                      ₦{r.sellRate?.toLocaleString() ?? '—'}
                    </p>
                  </div>
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
