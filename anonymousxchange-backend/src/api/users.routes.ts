import { Router } from 'express'
import { usersController } from '../controllers/users.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/me', authenticate, usersController.getMe)
router.patch('/me', authenticate, usersController.updateMe)

export default router
