import { Request, Response, NextFunction } from 'express'
import { z, ZodSchema } from 'zod'
import { AppError } from './error.middleware'

export const schemas = {
  register: z.object({
    email: z.string().email('Valid email required').max(255),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
  }),
  login: z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(1, 'Password required'),
    totpCode: z.string().regex(/^\d{6}$/, 'Authenticator code must be 6 digits').optional(),
  }),
  google: z.object({
    idToken: z.string().min(1).optional(),
    credential: z.string().min(1).optional(),
  }).refine((value) => value.idToken || value.credential, { message: 'Google credential is required' }),
  verify2FA: z.object({
    userId: z.string().cuid(),
    totpCode: z.string().regex(/^\d{6}$/, 'Authenticator code must be 6 digits'),
  }),
  forgotPassword: z.object({ email: z.string().email('Valid email required').max(255) }),
  resetPassword: z.object({
    token: z.string().min(32),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128).optional(),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128).optional(),
  }).refine((value) => value.password || value.newPassword, { message: 'New password is required' }),
  refresh: z.object({
    refreshToken: z.string().min(10),
  }),
  chatMessage: z.object({
    content: z.string().min(1).max(4000),
    conversationId: z.string().cuid().optional().or(z.literal('')),
  }),
  createTransaction: z.object({
    type: z.enum(['sell_giftcard', 'sell_crypto', 'buy_crypto']),
    asset: z.string().min(1).max(100),
    amount: z.number().positive().optional(),
    details: z.record(z.unknown()).optional(),
  }),
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const message = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ')
      return next(new AppError(message, 400))
    }
    req.body = result.data
    next()
  }
}
