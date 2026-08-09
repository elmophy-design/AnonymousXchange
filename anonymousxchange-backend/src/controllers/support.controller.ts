import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { logger } from '../utils/logger'
import { notificationService } from '../services/notification.service'

export const supportController = {
  async createTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subject, message, email } = req.body
      if (!subject || !message) {
        return res.status(400).json({ success: false, message: 'subject and message required' })
      }

      const payload = {
        subject: String(subject).slice(0, 200),
        message: String(message).slice(0, 5000),
        email: email || req.user?.email || 'anonymous',
        userId: req.user?.id,
        createdAt: new Date().toISOString(),
      }

      logger.info('[support:ticket]', payload)

      // Optional: notify ops via email if SMTP configured
      try {
        if (notificationService?.sendSupportTicket) {
          await notificationService.sendSupportTicket(payload)
        }
      } catch {
        // non-blocking
      }

      res.status(201).json({
        success: true,
        message: 'Ticket received. Our team will respond shortly.',
        data: { id: `tkt_${Date.now()}` },
      })
    } catch (error) {
      next(error)
    }
  },
}
