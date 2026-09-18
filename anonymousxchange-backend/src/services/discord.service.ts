import axios from 'axios'
import { logger } from '../utils/logger'
import { chatService } from './chat.service'
import { prisma } from '../config/database'

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const API = BOT_TOKEN ? 'https://discord.com/api/v10' : null

export const discordService = {
  isConfigured() {
    return Boolean(BOT_TOKEN)
  },

  async sendMessage(channelId: string, text: string) {
    if (!API || !BOT_TOKEN) {
      logger.info(`[discord:skipped] channelId=${channelId}`)
      return
    }

    await axios.post(
      `${API}/channels/${channelId}/messages`,
      {
        content: text,
      },
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )
  },

  async handleIncoming(payload: {
    type?: number
    message?: {
      id?: string
      author?: { id?: string; bot?: boolean }
      channel_id?: string
      content?: string
    }
  }) {
    if (payload.type === 1) {
      return { ok: true, type: 1 }
    }

    const message = payload.message
    if (!message?.content || message.author?.bot) {
      return { ok: true }
    }

    const externalId = String(message.author?.id || '')
    if (!externalId) {
      return { ok: true }
    }

    const link = await prisma.channelLink.findUnique({
      where: {
        channel_externalId: {
          channel: 'discord',
          externalId,
        },
      },
    })

    const result = await chatService.sendMessage({
      content: message.content,
      userId: link?.userId,
      channel: 'discord',
    })

    await this.sendMessage(message.channel_id || '', result.assistantMessage.content)

    return { ok: true }
  },
}
