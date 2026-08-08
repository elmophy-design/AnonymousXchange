import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { config } from './config'
import { errorHandler } from './middleware/error.middleware'
import { apiLimiter } from './middleware/rateLimit.middleware'
import apiRoutes from './api'

const app = express()

app.set('trust proxy', 1)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: config.nodeEnv === 'production' ? undefined : false,
  })
)
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
)
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'anonymousxchange-backend',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api', apiLimiter, apiRoutes)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

app.use(errorHandler)

export { app }
