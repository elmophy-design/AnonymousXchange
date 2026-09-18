import { Router } from 'express'
import { prisma } from '../config/database'
import { logger } from '../utils/logger'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const startedAt = process.uptime()
    const dbHealthy = await prisma.$queryRawUnsafe('SELECT 1')
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        uptimeSeconds: Number(startedAt.toFixed(2)),
        database: dbHealthy ? 'connected' : 'unavailable',
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    logger.error('Health check failed', error)
    next(error)
  }
})

export default router
