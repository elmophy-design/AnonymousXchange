import axios from 'axios'
import { logger } from '../utils/logger'
import { chatService } from './chat.service'
import { prisma } from '../config/database'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const API = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : null

export const telegramService = {
  isConfigured() {
    return Boolean(TOKEN)
  },

  async sendMessage(chatId: string | number, text: string) {
    if (!API) {
      logger.info(`[telegram:skipped] chatId=${chatId}`)
      return
    }
    await axios.post(`${API}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    })
  },

  async handleUpdate(update: {
    message?: { chat: { id: number }; text?: string; from?: { id: number } }
  }) {
    const msg = update.message
    if (!msg?.text) return

    const externalId = String(msg.chat.id)

    // Link or find user via ChannelLink
    const link = await prisma.channelLink.findUnique({
      where: { channel_externalId: { channel: 'telegram', externalId } },
    })

    const result = await chatService.sendMessage({
      content: msg.text,
      userId: link?.userId,
      channel: 'telegram',
    })

    await this.sendMessage(msg.chat.id, result.assistantMessage.content)
  },

  async setWebhook(url: string) {
    if (!API) return { skipped: true }
    const { data } = await axios.post(`${API}/setWebhook`, { url })
    return data
  },
}
