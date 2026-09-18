import { Request, Response, NextFunction } from 'express'
import { z, ZodSchema } from 'zod'
import { AppError } from './error.middleware'

export const schemas = {
  register: z.object({
    email: z.string().email('Valid email required').max(255),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
  }),
  login: z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(1, 'Password required'),
  }),
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
