import { Router } from 'express'
import authRoutes from './auth.routes'
import ratesRoutes from './rates.routes'
import transactionsRoutes from './transactions.routes'
import chatRoutes from './chat.routes'
import usersRoutes from './users.routes'
import adminRoutes from './admin.routes'
import healthRoutes from './health.routes'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/rates', ratesRoutes)
router.use('/transactions', transactionsRoutes)
router.use('/chat', chatRoutes)
router.use('/users', usersRoutes)
router.use('/admin', adminRoutes)

export default router
