import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'
import { AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body
      const result = await authService.register({ email, password, firstName, lastName })
      res.status(201).json({ success: true, message: 'Registered successfully', data: result })
    } catch (error) {
      next(error)
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, totpCode } = req.body
      if (!email || !password) throw new AppError('Email and password are required', 400)
      const result = await authService.login({ email, password, totpCode })
      res.status(200).json({ success: true, message: 'Logged in successfully', data: result })
    } catch (error) {
      next(error)
    }
  },

  async google(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken, credential } = req.body
      const token = idToken || credential
      const result = await authService.googleLogin(token)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  },

  async verify2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, totpCode } = req.body
      if (!userId || !totpCode) throw new AppError('userId and totpCode required', 400)
      const result = await authService.verify2FALogin(userId, totpCode)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      const result = await authService.requestPasswordReset(email)
      res.status(200).json({
        success: true,
        message: 'If that email exists, a reset link was sent.',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password, newPassword } = req.body
      const result = await authService.resetPassword(token, newPassword || password)
      res.status(200).json({ success: true, message: 'Password reset successful', data: result })
    } catch (error) {
      next(error)
    }
  },

  async setup2FA(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new AppError('Authentication required', 401)
      const result = await authService.setup2FA(req.user.id)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  },

  async enable2FA(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new AppError('Authentication required', 401)
      const { totpCode } = req.body
      const result = await authService.enable2FA(req.user.id, totpCode)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  },

  async disable2FA(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new AppError('Authentication required', 401)
      const { totpCode } = req.body
      const result = await authService.disable2FA(req.user.id, totpCode)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      const result = await authService.refresh(refreshToken)
      res.status(200).json({ success: true, message: 'Token refreshed', data: result })
    } catch (error) {
      next(error)
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      await authService.logout(refreshToken)
      res.status(200).json({ success: true, message: 'Logged out successfully' })
    } catch (error) {
      next(error)
    }
  },
}
