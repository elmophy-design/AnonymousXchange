import axios from 'axios'
import { prisma } from '../config/database'
import { hashPassword, comparePassword } from '../utils/password'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt'
import { AppError } from '../middleware/error.middleware'
import { randomToken } from '../utils/tokens'
import {
  generateTotpSecret,
  verifyTotp,
  totpOtpauthUrl,
} from '../utils/totp'
import { notificationService } from './notification.service'

export interface RegisterInput {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface LoginInput {
  email: string
  password: string
  totpCode?: string
}

function sanitizeUser(user: {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  isVerified: boolean
  role: string
  preferredChannel?: string | null
  twoFactorEnabled?: boolean
  avatarUrl?: string | null
  googleId?: string | null
  createdAt: Date
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified,
    role: user.role,
    preferredChannel: user.preferredChannel ?? null,
    twoFactorEnabled: !!user.twoFactorEnabled,
    avatarUrl: user.avatarUrl ?? null,
    hasGoogle: !!user.googleId,
    createdAt: user.createdAt,
  }
}

async function issueTokens(user: { id: string; email: string | null }) {
  const accessToken = signAccessToken({ userId: user.id, email: user.email })
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email })
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  })
  return { accessToken, refreshToken }
}

export const authService = {
  async register(input: RegisterInput) {
    const email = input.email.toLowerCase().trim()
    if (!email || !input.password) throw new AppError('Email and password are required', 400)
    if (input.password.length < 6) throw new AppError('Password must be at least 6 characters', 400)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new AppError('Email already registered', 409)

    const passwordHash = await hashPassword(input.password)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: input.firstName?.trim() || null,
        lastName: input.lastName?.trim() || null,
      },
    })

    const tokens = await issueTokens(user)
    return { user: sanitizeUser(user), ...tokens }
  },

  async login(input: LoginInput) {
    const email = input.email.toLowerCase().trim()
    if (!email || !input.password) throw new AppError('Email and password are required', 400)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) throw new AppError('Invalid email or password', 401)

    const ok = await comparePassword(input.password, user.passwordHash)
    if (!ok) throw new AppError('Invalid email or password', 401)

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!input.totpCode) {
        return { requires2FA: true as const, message: 'Enter your authenticator code' }
      }
      if (!verifyTotp(user.twoFactorSecret, input.totpCode)) {
        throw new AppError('Invalid authenticator code', 401)
      }
    }

    const tokens = await issueTokens(user)
    return { user: sanitizeUser(user), ...tokens }
  },

  async googleLogin(idToken: string) {
    if (!idToken) throw new AppError('Google idToken is required', 400)

    // Verify via Google tokeninfo (works with GIS credential JWT)
    let payload: {
      sub?: string
      email?: string
      email_verified?: string | boolean
      given_name?: string
      family_name?: string
      picture?: string
      aud?: string
    }
    try {
      const { data } = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
        params: { id_token: idToken },
        timeout: 10000,
      })
      payload = data
    } catch {
      throw new AppError('Invalid Google token', 401)
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    if (clientId && payload.aud && payload.aud !== clientId) {
      throw new AppError('Google token audience mismatch', 401)
    }

    const email = payload.email?.toLowerCase()
    const googleId = payload.sub
    if (!email || !googleId) throw new AppError('Google account missing email', 400)

    const verified = payload.email_verified === true || payload.email_verified === 'true'

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          firstName: payload.given_name || null,
          lastName: payload.family_name || null,
          avatarUrl: payload.picture || null,
          isVerified: verified,
        },
      })
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleId,
          avatarUrl: user.avatarUrl || payload.picture || null,
          isVerified: user.isVerified || verified,
          firstName: user.firstName || payload.given_name || null,
          lastName: user.lastName || payload.family_name || null,
        },
      })
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      return {
        requires2FA: true as const,
        tempUserId: user.id,
        message: 'Enter your authenticator code',
      }
    }

    const tokens = await issueTokens(user)
    return { user: sanitizeUser(user), ...tokens }
  },

  async verify2FALogin(userId: string, totpCode: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
      throw new AppError('2FA not enabled', 400)
    }
    if (!verifyTotp(user.twoFactorSecret, totpCode)) {
      throw new AppError('Invalid authenticator code', 401)
    }
    const tokens = await issueTokens(user)
    return { user: sanitizeUser(user), ...tokens }
  },

  async requestPasswordReset(emailRaw: string) {
    const email = emailRaw.toLowerCase().trim()
    if (!email) throw new AppError('Email is required', 400)

    const user = await prisma.user.findUnique({ where: { email } })
    // Always return success to avoid email enumeration
    if (!user) return { success: true }

    const token = randomToken(32)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1h
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    })

    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173'
    const link = `${frontend}/reset-password?token=${token}`

    try {
      await notificationService.sendEmail(
        email,
        'Reset your AnonymousXchange password',
        `<p>Click the link below to reset your password (valid 1 hour):</p>
         <p><a href="${link}">${link}</a></p>
         <p>If you did not request this, ignore this email.</p>`
      )
    } catch {
      // logged inside notification service
    }

    return { success: true, ...(process.env.NODE_ENV !== 'production' ? { devResetLink: link } : {}) }
  },

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) throw new AppError('Token and new password required', 400)
    if (newPassword.length < 6) throw new AppError('Password must be at least 6 characters', 400)

    const row = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new AppError('Invalid or expired reset token', 400)
    }

    const passwordHash = await hashPassword(newPassword)
    await prisma.$transaction([
      prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
      prisma.refreshToken.deleteMany({ where: { userId: row.userId } }),
    ])

    return { success: true }
  },

  async setup2FA(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.email) throw new AppError('User not found', 404)

    const secret = generateTotpSecret()
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    })

    const otpauthUrl = totpOtpauthUrl(secret, user.email)
    return { secret, otpauthUrl }
  },

  async enable2FA(userId: string, totpCode: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.twoFactorSecret) throw new AppError('Call setup first', 400)
    if (!verifyTotp(user.twoFactorSecret, totpCode)) {
      throw new AppError('Invalid authenticator code', 400)
    }
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    })
    return { success: true, twoFactorEnabled: true }
  },

  async disable2FA(userId: string, totpCode: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
      throw new AppError('2FA is not enabled', 400)
    }
    if (!verifyTotp(user.twoFactorSecret, totpCode)) {
      throw new AppError('Invalid authenticator code', 400)
    }
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    })
    return { success: true, twoFactorEnabled: false }
  },

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new AppError('Refresh token required', 400)

    let payload: { userId: string; email?: string }
    try {
      payload = verifyRefreshToken(refreshToken) as { userId: string; email?: string }
    } catch {
      throw new AppError('Invalid refresh token', 401)
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Refresh token expired', 401)
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) throw new AppError('User not found', 404)

    await prisma.refreshToken.delete({ where: { token: refreshToken } })
    const tokens = await issueTokens(user)
    return { user: sanitizeUser(user), ...tokens }
  },

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
    return { success: true }
  },
}
