import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { authLimiter } from '../middleware/rateLimit.middleware'
import { validateBody, schemas } from '../middleware/validate.middleware'

const router = Router()

router.post('/register', authLimiter, validateBody(schemas.register), authController.register)
router.post('/login', authLimiter, validateBody(schemas.login), authController.login)
router.post('/refresh', authLimiter, validateBody(schemas.refresh), authController.refresh)
router.post('/logout', authController.logout)

export default router
