import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { authLimiter } from '../middleware/rateLimit.middleware'
import { validateBody, schemas } from '../middleware/validate.middleware'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.post('/register', authLimiter, validateBody(schemas.register), authController.register)
router.post('/login', authLimiter, validateBody(schemas.login), authController.login)
router.post('/google', authLimiter, authController.google)
router.post('/2fa/verify', authLimiter, authController.verify2FA)
router.post('/forgot-password', authLimiter, authController.forgotPassword)
router.post('/reset-password', authLimiter, authController.resetPassword)
router.post('/2fa/setup', authenticate, authController.setup2FA)
router.post('/2fa/enable', authenticate, authController.enable2FA)
router.post('/2fa/disable', authenticate, authController.disable2FA)
router.post('/refresh', authLimiter, validateBody(schemas.refresh), authController.refresh)
router.post('/logout', authController.logout)

export default router
