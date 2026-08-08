import { Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'

export const usersController = {
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('Authentication required', 401)
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isVerified: true,
          role: true,
          createdAt: true,
        },
      })

      if (!user) {
        throw new AppError('User not found', 404)
      }

      res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('Authentication required', 401)
      }

      const { firstName, lastName } = req.body

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          firstName: firstName?.trim() || undefined,
          lastName: lastName?.trim() || undefined,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isVerified: true,
          role: true,
          createdAt: true,
        },
      })

      res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  },
}
