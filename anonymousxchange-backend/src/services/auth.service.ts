import { prisma } from '../config/database'
import { hashPassword, comparePassword } from '../utils/password'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt'
import { AppError } from '../middleware/error.middleware'

export interface RegisterInput {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface LoginInput {
  email: string
  password: string
}

function sanitizeUser(user: {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  isVerified: boolean
  role: string
  createdAt: Date
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified,
    role: user.role,
    createdAt: user.createdAt,
  }
}

export const authService = {
  async register(input: RegisterInput) {
    const email = input.email.toLowerCase().trim()

    if (!email || !input.password) {
      throw new AppError('Email and password are required', 400)
    }

    if (input.password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400)
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new AppError('Email already registered', 409)
    }

    const passwordHash = await hashPassword(input.password)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: input.firstName?.trim() || null,
        lastName: input.lastName?.trim() || null,
      },
    })

    const accessToken = signAccessToken({ userId: user.id, email: user.email })
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email })

    // Store refresh token
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    })

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    }
  },

  async login(input: LoginInput) {
    const email = input.email.toLowerCase().trim()

    if (!email || !input.password) {
      throw new AppError('Email and password are required', 400)
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401)
    }

    const valid = await comparePassword(input.password, user.passwordHash)
    if (!valid) {
      throw new AppError('Invalid email or password', 401)
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email })
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    })

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    }
  },

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400)
    }

    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      throw new AppError('Invalid or expired refresh token', 401)
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401)
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      throw new AppError('User not found', 401)
    }

    // Rotate tokens
    await prisma.refreshToken.delete({ where: { id: stored.id } })

    const newAccessToken = signAccessToken({ userId: user.id, email: user.email })
    const newRefreshToken = signRefreshToken({ userId: user.id, email: user.email })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt,
      },
    })

    return {
      user: sanitizeUser(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  },

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
    return { success: true }
  },
}
