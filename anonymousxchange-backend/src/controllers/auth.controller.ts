import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'
import { AppError } from '../middleware/error.middleware'

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body

      if (!email || !password) {
        throw new AppError('Email and password are required', 400)
      }

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
      })

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        throw new AppError('Email and password are required', 400)
      }

      const result = await authService.login({ email, password })

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body

      const result = await authService.refresh(refreshToken)

      res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      await authService.logout(refreshToken)

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      })
    } catch (error) {
      next(error)
    }
  },
}
