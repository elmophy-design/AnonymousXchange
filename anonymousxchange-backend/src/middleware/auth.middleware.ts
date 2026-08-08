import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { AppError } from './error.middleware'
import { prisma } from '../config/database'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email?: string | null
  }
}

export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401)
    }

    const token = header.split(' ')[1]
    const payload = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    })

    if (!user) {
      throw new AppError('User not found', 401)
    }

    req.user = { id: user.id, email: user.email }
    next()
  } catch (error) {
    if (error instanceof AppError) {
      return next(error)
    }
    next(new AppError('Invalid or expired token', 401))
  }
}

/** Optional auth – attaches user if token present, otherwise continues */
export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
      const token = header.split(' ')[1]
      const payload = verifyAccessToken(token)
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true },
      })
      if (user) {
        req.user = { id: user.id, email: user.email }
      }
    }
  } catch {
    // ignore invalid token for optional auth
  }
  next()
}
