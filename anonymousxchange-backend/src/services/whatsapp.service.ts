import axios from 'axios'
import { logger } from '../utils/logger'
import { chatService } from './chat.service'
import { prisma } from '../config/database'

const TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const API = TOKEN && PHONE_ID
  ? `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`
  : null

export const whatsappService = {
  isConfigured() {
    return Boolean(API)
  },

  async sendMessage(to: string, text: string) {
    if (!API || !TOKEN) {
      logger.info(`[whatsapp:skipped] to=${to}`)
      return
    }
    await axios.post(
      API,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    )
  },

  async handleIncoming(payload: {
    from: string
    text: string
  }) {
    const externalId = payload.from
    const link = await prisma.channelLink.findUnique({
      where: { channel_externalId: { channel: 'whatsapp', externalId } },
    })

    const result = await chatService.sendMessage({
      content: payload.text,
      userId: link?.userId,
      channel: 'whatsapp',
    })

    await this.sendMessage(payload.from, result.assistantMessage.content)
  },
}
