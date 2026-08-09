import { Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'
import { comparePassword, hashPassword } from '../utils/password'

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
          preferredChannel: true,
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

      const { firstName, lastName, preferredChannel, currentPassword, newPassword } = req.body

      const updateData: Record<string, unknown> = {}

      if (typeof firstName === 'string') {
        updateData.firstName = firstName.trim() || null
      }
      if (typeof lastName === 'string') {
        updateData.lastName = lastName.trim() || null
      }
      if (typeof preferredChannel === 'string') {
        const normalized = preferredChannel.toLowerCase()
        if (!['web', 'telegram', 'whatsapp'].includes(normalized)) {
          throw new AppError('Preferred channel must be web, telegram, or whatsapp', 400)
        }
        updateData.preferredChannel = normalized
      }

      if (currentPassword || newPassword) {
        if (!currentPassword || !newPassword) {
          throw new AppError('Both current and new password are required', 400)
        }
        if (newPassword.length < 6) {
          throw new AppError('New password must be at least 6 characters', 400)
        }

        const existing = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { passwordHash: true },
        })

        if (!existing?.passwordHash) {
          throw new AppError('Password update is not available for this account', 400)
        }

        const valid = await comparePassword(currentPassword, existing.passwordHash)
        if (!valid) {
          throw new AppError('Current password is incorrect', 401)
        }

        updateData.passwordHash = await hashPassword(newPassword)
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          preferredChannel: true,
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
