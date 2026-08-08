import { Router } from 'express'
import { transactionsController } from '../controllers/transactions.controller'
import { authenticate, optionalAuth } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, transactionsController.getAll)
router.get('/:id', authenticate, transactionsController.getOne)
router.post('/', optionalAuth, transactionsController.create)

export default router
