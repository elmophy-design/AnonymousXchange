import axios from 'axios'
import { prisma } from '../config/database'
import { logger } from '../utils/logger'
import { config } from '../config'

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  USDC: 'usd-coin',
  BNB: 'binancecoin',
  SOL: 'solana',
}

const GIFTCARD_RATES: Record<string, { buy: number; sell: number }> = {
  'Apple Gift Card': { buy: 920, sell: 980 },
  Steam: { buy: 850, sell: 920 },
  Amazon: { buy: 800, sell: 880 },
  'Google Play': { buy: 780, sell: 860 },
  iTunes: { buy: 900, sell: 960 },
  Xbox: { buy: 820, sell: 890 },
  Nike: { buy: 750, sell: 830 },
  Walmart: { buy: 780, sell: 850 },
  'Discord Nitro': { buy: 880, sell: 940 },
  'Roblox': { buy: 760, sell: 840 },
  'PlayStation': { buy: 830, sell: 900 },
  'Nintendo eShop': { buy: 810, sell: 880 },
  'Vanilla': { buy: 700, sell: 780 },
  'Sephora': { buy: 720, sell: 800 },
}

let cryptoRefreshInFlight: Promise<RateItem[]> | null = null

export interface RateItem {
  asset: string
  type: string
  buyRate: number | null
  sellRate: number | null
  currency: string
  source: string | null
  updatedAt?: Date
}

export const ratesService = {
  async fetchCryptoRates(): Promise<RateItem[]> {
    try {
      const ids = Object.values(CRYPTO_IDS).join(',')
      const { data } = await axios.get(`${COINGECKO_BASE}/simple/price`, {
        params: {
          ids,
          vs_currencies: 'usd',
        },
        headers: config.rates.coinGeckoApiKey
          ? { 'x-cg-demo-api-key': config.rates.coinGeckoApiKey }
          : undefined,
        timeout: 10000,
      })

      const results: RateItem[] = []

      for (const [symbol, geckoId] of Object.entries(CRYPTO_IDS)) {
        const usd = data[geckoId]?.usd
        if (!usd) continue

        const midNgn = usd * config.rates.usdToNgn
        const buyRate = Math.round(midNgn * 1.015)
        const sellRate = Math.round(midNgn * 0.985)

        results.push({
          asset: symbol,
          type: 'crypto',
          buyRate,
          sellRate,
          currency: 'NGN',
          source: 'coingecko',
        })

        await prisma.rate.upsert({
          where: {
            asset_type_currency: {
              asset: symbol,
              type: 'crypto',
              currency: 'NGN',
            },
          },
          create: {
            asset: symbol,
            type: 'crypto',
            buyRate,
            sellRate,
            currency: 'NGN',
            source: 'coingecko',
          },
          update: {
            buyRate,
            sellRate,
            source: 'coingecko',
          },
        })
      }

      return results
    } catch (error) {
      logger.error('Failed to fetch crypto rates', error)
      return this.getFromDb('crypto')
    }
  },

  async seedGiftCardRates(): Promise<void> {
    for (const [asset, rates] of Object.entries(GIFTCARD_RATES)) {
      await prisma.rate.upsert({
        where: {
          asset_type_currency: {
            asset,
            type: 'giftcard',
            currency: 'NGN',
          },
        },
        create: {
          asset,
          type: 'giftcard',
          buyRate: rates.buy,
          sellRate: rates.sell,
          currency: 'NGN',
          source: 'manual',
        },
        update: {
          buyRate: rates.buy,
          sellRate: rates.sell,
        },
      })
    }
  },

  async ensureCryptoRates(): Promise<void> {
    const latest = await prisma.rate.findFirst({
      where: { type: 'crypto' },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    })
    const isFresh = latest && Date.now() - latest.updatedAt.getTime() < config.rates.cacheTtlMs
    if (!isFresh) await this.refreshCrypto()
  },

  async refreshCrypto(): Promise<void> {
    if (!cryptoRefreshInFlight) {
      cryptoRefreshInFlight = this.fetchCryptoRates().finally(() => {
        cryptoRefreshInFlight = null
      })
    }
    await cryptoRefreshInFlight
  },

  async ensureGiftCardRates(): Promise<void> {
    const count = await prisma.rate.count({ where: { type: 'giftcard' } })
    if (count < Object.keys(GIFTCARD_RATES).length) await this.seedGiftCardRates()
  },

  async refreshAll(): Promise<void> {
    await Promise.all([this.refreshCrypto(), this.seedGiftCardRates()])
  },

  async getFromDb(type?: string): Promise<RateItem[]> {
    const where = type ? { type } : {}
    const rows = await prisma.rate.findMany({
      where,
      orderBy: [{ type: 'asc' }, { asset: 'asc' }],
    })

    return rows.map((r) => ({
      asset: r.asset,
      type: r.type,
      buyRate: r.buyRate ? Number(r.buyRate) : null,
      sellRate: r.sellRate ? Number(r.sellRate) : null,
      currency: r.currency,
      source: r.source,
      updatedAt: r.updatedAt,
    }))
  },

  async getAll(): Promise<RateItem[]> {
    await Promise.all([this.ensureCryptoRates(), this.ensureGiftCardRates()])
    return this.getFromDb()
  },

  async getOne(asset: string): Promise<RateItem | null> {
    const upper = asset.toUpperCase()

    if (CRYPTO_IDS[upper]) {
      await this.ensureCryptoRates()
    } else {
      await this.ensureGiftCardRates()
    }

    const existing = await prisma.rate.findFirst({
      where: {
        OR: [
          { asset: upper, type: 'crypto' },
          { asset: { equals: asset, mode: 'insensitive' }, type: 'giftcard' },
        ],
      },
    })

    if (existing) {
      return {
        asset: existing.asset,
        type: existing.type,
        buyRate: existing.buyRate ? Number(existing.buyRate) : null,
        sellRate: existing.sellRate ? Number(existing.sellRate) : null,
        currency: existing.currency,
        source: existing.source,
        updatedAt: existing.updatedAt,
      }
    }

    return null
  },

  formatForChat(rates: RateItem[]): string {
    const crypto = rates.filter((r) => r.type === 'crypto')
    const giftcards = rates.filter((r) => r.type === 'giftcard')

    let text = ''
    if (crypto.length) {
      text += 'Crypto rates (NGN):\n'
      for (const r of crypto) {
        text += `• ${r.asset}: Buy ₦${r.buyRate?.toLocaleString()} | Sell ₦${r.sellRate?.toLocaleString()}\n`
      }
    }
    if (giftcards.length) {
      text += '\nGift card sell rates (per $1 face value):\n'
      for (const r of giftcards) {
        text += `• ${r.asset}: ₦${r.sellRate}\n`
      }
    }
    return text.trim()
  },
}
