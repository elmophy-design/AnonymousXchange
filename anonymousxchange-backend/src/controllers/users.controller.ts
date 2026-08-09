import { Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'
import { hashPassword, comparePassword } from '../utils/password'

export const usersController = {
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new AppError('Authentication required', 401)

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

      if (!user) throw new AppError('User not found', 404)

      res.status(200).json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  },

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new AppError('Authentication required', 401)

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

      res.status(200).json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  },

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new AppError('Authentication required', 401)

      const { currentPassword, newPassword } = req.body
      if (!currentPassword || !newPassword) {
        throw new AppError('currentPassword and newPassword are required', 400)
      }
      if (String(newPassword).length < 8) {
        throw new AppError('Password must be at least 8 characters', 400)
      }

      const user = await prisma.user.findUnique({ where: { id: req.user.id } })
      if (!user?.passwordHash) throw new AppError('User not found', 404)

      const ok = await comparePassword(currentPassword, user.passwordHash)
      if (!ok) throw new AppError('Current password is incorrect', 400)

      const passwordHash = await hashPassword(newPassword)
      await prisma.user.update({
        where: { id: req.user.id },
        data: { passwordHash },
      })

      res.status(200).json({ success: true, message: 'Password updated' })
    } catch (error) {
      next(error)
    }
  },

  async getChannels(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new AppError('Authentication required', 401)

      const channels = await prisma.channelLink.findMany({
        where: { userId: req.user.id },
        select: {
          id: true,
          channel: true,
          externalId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      res.status(200).json({ success: true, data: channels })
    } catch (error) {
      next(error)
    }
  },
}
