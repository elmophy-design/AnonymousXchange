import { prisma } from '../config/database'
import { AppError } from '../middleware/error.middleware'

export const receiptService = {
  async getForTransaction(transactionId: string, userId?: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })
    if (!tx) throw new AppError('Transaction not found', 404)
    if (userId && tx.userId && tx.userId !== userId) {
      throw new AppError('Forbidden', 403)
    }

    return {
      id: tx.id,
      reference: tx.reference,
      type: tx.type,
      asset: tx.asset,
      amount: tx.amount ? Number(tx.amount) : null,
      rate: tx.rate ? Number(tx.rate) : null,
      fee: tx.fee ? Number(tx.fee) : null,
      payoutAmount: tx.payoutAmount ? Number(tx.payoutAmount) : null,
      currency: tx.currency,
      status: tx.status,
      createdAt: tx.createdAt,
      details: tx.details,
      receiptUrl: tx.receiptUrl,
    }
  },
}
