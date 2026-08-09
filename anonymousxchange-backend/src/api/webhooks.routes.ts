import { Router, Request, Response, NextFunction } from 'express'
import { telegramService } from '../services/telegram.service'
import { whatsappService } from '../services/whatsapp.service'
import { logger } from '../utils/logger'

const router = Router()

// Telegram webhook
router.post('/telegram', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ ok: true }) // acknowledge immediately
    await telegramService.handleUpdate(req.body)
  } catch (error) {
    logger.error('Telegram webhook error', error)
    // already responded
  }
})

// WhatsApp Cloud API webhook verification (GET)
router.get('/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'anonymousxchange_verify'

  if (mode === 'subscribe' && token === verifyToken) {
    res.status(200).send(challenge)
  } else {
    res.sendStatus(403)
  }
})

// WhatsApp incoming messages (POST)
router.post('/whatsapp', async (req: Request, res: Response) => {
  try {
    res.sendStatus(200)
    const entry = req.body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages
    if (!messages?.length) return

    for (const msg of messages) {
      if (msg.type === 'text' && msg.text?.body) {
        await whatsappService.handleIncoming({
          from: msg.from,
          text: msg.text.body,
        })
      }
    }
  } catch (error) {
    logger.error('WhatsApp webhook error', error)
  }
})

export default router
