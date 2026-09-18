import { prisma } from '../config/database'
import { AppError } from '../middleware/error.middleware'
import { ratesService } from './rates.service'
import { Prisma } from '@prisma/client'

function generateReference() {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `AX-${ts}-${rand}`
}

export interface CreateTransactionInput {
  userId?: string
  conversationId?: string
  type: 'sell_giftcard' | 'sell_crypto' | 'buy_crypto'
  asset: string
  amount?: number
  details?: Record<string, unknown>
}

type TxRow = {
  id: string
  type: string
  asset: string
  amount: Prisma.Decimal | null
  rate: Prisma.Decimal | null
  fee: Prisma.Decimal | null
  payoutAmount: Prisma.Decimal | null
  currency: string | null
  status: string
  reference: string | null
  receiptUrl: string | null
  details: Prisma.JsonValue
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export const transactionsService = {
  async create(input: CreateTransactionInput) {
    if (!input.type || !input.asset) {
      throw new AppError('type and asset are required', 400)
    }

    let rate: number | null = null
    let fee = 0
    let payoutAmount: number | null = null

    const rateRow = await ratesService.getOne(input.asset)
    if (rateRow) {
      if (input.type === 'buy_crypto') {
        rate = rateRow.buyRate
      } else {
        rate = rateRow.sellRate
      }
    }

    if (rate && input.amount) {
      if (input.type === 'sell_giftcard') {
        payoutAmount = Math.round(input.amount * rate)
      } else if (input.type === 'sell_crypto') {
        payoutAmount = Math.round(input.amount * rate)
      } else if (input.type === 'buy_crypto') {
        payoutAmount = rate > 0 ? Number((input.amount / rate).toFixed(8)) : null
      }
      fee = Math.round((payoutAmount || 0) * 0.01)
    }

    const detailsValue: Prisma.InputJsonValue =
      (input.details as Prisma.InputJsonValue) ?? {}

    const tx = await prisma.transaction.create({
      data: {
        userId: input.userId || null,
        conversationId: input.conversationId || null,
        type: input.type,
        asset: input.asset,
        amount: input.amount != null ? new Prisma.Decimal(input.amount) : null,
        rate: rate != null ? new Prisma.Decimal(rate) : null,
        fee: fee ? new Prisma.Decimal(fee) : null,
        payoutAmount:
          payoutAmount != null ? new Prisma.Decimal(payoutAmount) : null,
        currency: 'NGN',
        status: 'initiated',
        details: detailsValue,
        reference: generateReference(),
      },
    })

    return this.format(tx)
  },

  async list(userId: string, filters?: { status?: string; type?: string }) {
    const where: Prisma.TransactionWhereInput = { userId }
    if (filters?.status) where.status = filters.status
    if (filters?.type) where.type = filters.type

    const rows = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return rows.map((row) => this.format(row))
  },

  async getById(id: string, userId?: string) {
    const tx = await prisma.transaction.findUnique({ where: { id } })
    if (!tx) throw new AppError('Transaction not found', 404)
    if (userId && tx.userId && tx.userId !== userId) {
      throw new AppError('Not authorized', 403)
    }
    return this.format(tx)
  },

  async getByReference(reference: string, userId?: string) {
    const tx = await prisma.transaction.findUnique({ where: { reference } })
    if (!tx) throw new AppError('Transaction not found', 404)
    if (userId && tx.userId && tx.userId !== userId) {
      throw new AppError('Not authorized', 403)
    }
    return this.format(tx)
  },

  async updateStatus(
    id: string,
    status: string,
    extra?: { details?: Record<string, unknown>; notes?: string }
  ) {
    const data: Prisma.TransactionUpdateInput = {
      status,
    }

    if (extra?.notes !== undefined) {
      data.notes = extra.notes
    }

    if (extra?.details) {
      data.details = extra.details as Prisma.InputJsonValue
    }

    const tx = await prisma.transaction.update({
      where: { id },
      data,
    })
    return this.format(tx)
  },

  async getStats(userId: string) {
    const [active, completed, all] = await Promise.all([
      prisma.transaction.count({
        where: {
          userId,
          status: {
            in: [
              'initiated',
              'awaiting_details',
              'pending_payment',
              'processing',
            ],
          },
        },
      }),
      prisma.transaction.count({
        where: { userId, status: 'completed' },
      }),
      prisma.transaction.findMany({
        where: { userId, status: 'completed' },
        select: { payoutAmount: true },
      }),
    ])

    const volume = all.reduce(
      (sum, t) => sum + (t.payoutAmount ? Number(t.payoutAmount) : 0),
      0
    )

    return { active, completed, volume }
  },

  format(tx: TxRow) {
    return {
      id: tx.id,
      type: tx.type,
      asset: tx.asset,
      amount: tx.amount != null ? Number(tx.amount) : null,
      rate: tx.rate != null ? Number(tx.rate) : null,
      fee: tx.fee != null ? Number(tx.fee) : null,
      payoutAmount: tx.payoutAmount != null ? Number(tx.payoutAmount) : null,
      currency: tx.currency,
      status: tx.status,
      reference: tx.reference,
      receiptUrl: tx.receiptUrl,
      details: tx.details,
      notes: tx.notes,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    }
  },
}
