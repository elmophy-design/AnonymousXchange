import { Response, NextFunction } from 'express'
import { transactionsService } from '../services/transactions.service'
import { AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

export const transactionsController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('Authentication required', 401)
      }

      const status = typeof req.query.status === 'string' ? req.query.status : undefined
      const type = typeof req.query.type === 'string' ? req.query.type : undefined

      const items = await transactionsService.list(req.user.id, { status, type })
      const stats = await transactionsService.getStats(req.user.id)

      res.status(200).json({
        success: true,
        data: { items, stats },
      })
    } catch (error) {
      next(error)
    }
  },

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = asString(req.params.id)
      const tx = await transactionsService.getById(id, req.user?.id)
      res.status(200).json({
        success: true,
        data: tx,
      })
    } catch (error) {
      next(error)
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, asset, amount, details } = req.body

      if (!type || !asset) {
        throw new AppError('type and asset are required', 400)
      }

      const tx = await transactionsService.create({
        userId: req.user?.id,
        type,
        asset,
        amount: amount != null ? Number(amount) : undefined,
        details,
      })

      res.status(201).json({
        success: true,
        data: tx,
      })
    } catch (error) {
      next(error)
    }
  },
}
