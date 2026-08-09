import { Router } from 'express'
import { supportController } from '../controllers/support.controller'
import { optionalAuth } from '../middleware/auth.middleware'

const router = Router()

router.post('/tickets', optionalAuth, supportController.createTicket)

export default router
