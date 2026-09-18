import { Router, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'
import { transactionsService } from '../services/transactions.service'
import { notificationService } from '../services/notification.service'

const router = Router()

async function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    if (!req.user?.id) throw new AppError('Authentication required', 401)
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user || user.role !== 'admin') {
      throw new AppError('Admin access required', 403)
    }
    next()
  } catch (e) {
    next(e)
  }
}

router.use(authenticate, requireAdmin)

router.get('/transactions', async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const rows = await prisma.transaction.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, email: true, firstName: true } },
      },
    })
    res.json({ success: true, data: rows })
  } catch (e) {
    next(e)
  }
})

router.patch('/transactions/:id/status', async (req: AuthRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { status, notes } = req.body
    if (!status) throw new AppError('status is required', 400)

    const tx = await transactionsService.updateStatus(id, status, { notes })

    // Notify user by email if possible
    if (tx && id) {
      const full = await prisma.transaction.findUnique({
        where: { id },
        include: { user: { select: { email: true } } },
      })
      if (full?.user?.email && full.reference) {
        await notificationService.notifyTransactionStatus({
          email: full.user.email,
          reference: full.reference,
          status,
          asset: full.asset,
        })
      }
    }

    res.json({ success: true, data: tx })
  } catch (e) {
    next(e)
  }
})

router.get('/stats', async (_req, res, next) => {
  try {
    const [users, txs, pending] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.transaction.count({
        where: { status: { in: ['initiated', 'awaiting_details', 'pending_payment', 'processing'] } },
      }),
    ])
    res.json({ success: true, data: { users, transactions: txs, pending } })
  } catch (e) {
    next(e)
  }
})

export default router
