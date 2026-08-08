import { Request, Response, NextFunction } from 'express'
import { ratesService } from '../services/rates.service'

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

export const ratesController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const rates = await ratesService.getAll()
      res.status(200).json({
        success: true,
        data: rates,
      })
    } catch (error) {
      next(error)
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = asString(req.params.asset)
      const rate = await ratesService.getOne(asset)
      if (!rate) {
        return res.status(404).json({
          success: false,
          message: 'Rate not found for this asset',
        })
      }
      res.status(200).json({
        success: true,
        data: rate,
      })
    } catch (error) {
      next(error)
    }
  },
}
