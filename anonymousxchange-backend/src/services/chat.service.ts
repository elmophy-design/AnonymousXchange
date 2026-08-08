import { prisma } from '../config/database'
import { AppError } from '../middleware/error.middleware'
import { ratesService } from './rates.service'
import { transactionsService } from './transactions.service'
import { aiService } from './ai.service'

async function generateReply(
  userText: string,
  context: { userId?: string; conversationId?: string }
): Promise<{ reply: string; transaction?: unknown }> {
  const lower = userText.toLowerCase()

  // --- Rates ---
  if (
    lower.includes('rate') ||
    lower.includes('price') ||
    lower.includes('how much') ||
    /\b(usdt|btc|bitcoin|eth|ethereum|sol|bnb)\b/.test(lower)
  ) {
    try {
      const rates = await ratesService.getAll()
      const formatted = ratesService.formatForChat(rates)
      return {
        reply:
          formatted +
          '\n\nWould you like to sell or buy? Just say e.g. “Sell 100 USDT” or “Sell $50 Apple Gift Card”.',
      }
    } catch {
      return {
        reply:
          'I’m having trouble fetching live rates right now. Please try again in a moment.',
      }
    }
  }

  // --- Track transaction ---
  if (lower.includes('track') || lower.includes('status') || lower.includes('receipt')) {
    const refMatch = userText.match(/AX-[A-Z0-9-]+/i)
    if (refMatch) {
      try {
        const tx = await transactionsService.getByReference(refMatch[0].toUpperCase(), context.userId)
        return {
          reply:
            `Transaction **${tx.reference}**\n` +
            `Type: ${tx.type}\nAsset: ${tx.asset}\n` +
            `Amount: ${tx.amount ?? '—'}\nStatus: **${tx.status}**\n` +
            `Created: ${new Date(tx.createdAt).toLocaleString()}`,
          transaction: tx,
        }
      } catch {
        return { reply: `I couldn’t find a transaction with reference ${refMatch[0]}.` }
      }
    }
    return {
      reply:
        'To track a transaction, please give me the reference (e.g. AX-XXXX-XXXX) or check your Dashboard.',
    }
  }

  // --- Create sell gift card ---
  if (
    (lower.includes('sell') && (lower.includes('gift') || lower.includes('apple') || lower.includes('steam') || lower.includes('amazon'))) ||
    lower.includes('gift card')
  ) {
    // Try extract amount
    const amountMatch = userText.match(/\$?\s*(\d+(?:\.\d+)?)/)
    const amount = amountMatch ? parseFloat(amountMatch[1]) : undefined

    let asset = 'Apple Gift Card'
    if (lower.includes('steam')) asset = 'Steam'
    else if (lower.includes('amazon')) asset = 'Amazon'
    else if (lower.includes('google')) asset = 'Google Play'
    else if (lower.includes('itunes')) asset = 'iTunes'
    else if (lower.includes('xbox')) asset = 'Xbox'

    try {
      const tx = await transactionsService.create({
        userId: context.userId,
        conversationId: context.conversationId,
        type: 'sell_giftcard',
        asset,
        amount,
        details: { source: 'chat', rawMessage: userText },
      })

      let reply = `I’ve started a **sell gift card** transaction for **${asset}**.`
      if (amount && tx.payoutAmount) {
        reply += `\nEstimated payout: **₦${tx.payoutAmount.toLocaleString()}** (ref: ${tx.reference})`
      } else {
        reply += `\nReference: **${tx.reference}**`
      }
      reply +=
        '\n\nPlease reply with:\n1. Exact card value & currency\n2. Card code (or say you’ll upload later)\n3. Preferred payout method (bank / USDT)'

      return { reply, transaction: tx }
    } catch (e) {
      return {
        reply: 'I had trouble creating the transaction. Please try again or use the Dashboard.',
      }
    }
  }

  // --- Sell crypto ---
  if (lower.includes('sell') && (lower.includes('btc') || lower.includes('bitcoin') || lower.includes('usdt') || lower.includes('eth') || lower.includes('crypto'))) {
    let asset = 'USDT'
    if (lower.includes('btc') || lower.includes('bitcoin')) asset = 'BTC'
    else if (lower.includes('eth')) asset = 'ETH'
    else if (lower.includes('sol')) asset = 'SOL'

    const amountMatch = userText.match(/(\d+(?:\.\d+)?)\s*(btc|eth|usdt|sol)?/i)
    const amount = amountMatch ? parseFloat(amountMatch[1]) : undefined

    try {
      const tx = await transactionsService.create({
        userId: context.userId,
        conversationId: context.conversationId,
        type: 'sell_crypto',
        asset,
        amount,
        details: { source: 'chat', rawMessage: userText },
      })

      let reply = `I’ve started a **sell ${asset}** transaction.`
      if (amount && tx.payoutAmount) {
        reply += `\nEstimated payout: **₦${tx.payoutAmount.toLocaleString()}**`
      }
      reply += `\nReference: **${tx.reference}**\n\nPlease send the ${asset} to the wallet address I’ll provide after you confirm, or share your preferred payout bank details.`

      return { reply, transaction: tx }
    } catch {
      return { reply: 'Couldn’t create the crypto sell transaction. Please try again.' }
    }
  }

  // --- Buy crypto ---
  if (lower.includes('buy') && (lower.includes('usdt') || lower.includes('btc') || lower.includes('eth') || lower.includes('crypto'))) {
    let asset = 'USDT'
    if (lower.includes('btc') || lower.includes('bitcoin')) asset = 'BTC'
    else if (lower.includes('eth')) asset = 'ETH'

    const amountMatch = userText.match(/(\d+(?:\.\d+)?)/)
    const amount = amountMatch ? parseFloat(amountMatch[1]) : undefined

    try {
      const tx = await transactionsService.create({
        userId: context.userId,
        conversationId: context.conversationId,
        type: 'buy_crypto',
        asset,
        amount,
        details: { source: 'chat', rawMessage: userText },
      })

      let reply = `I’ve started a **buy ${asset}** transaction.\nReference: **${tx.reference}**`
      if (tx.payoutAmount) {
        reply += `\nYou will receive approximately **${tx.payoutAmount} ${asset}**.`
      }
      reply += '\n\nPlease confirm the amount in Naira and your receiving wallet address.'

      return { reply, transaction: tx }
    } catch {
      return { reply: 'Couldn’t create the buy transaction. Please try again.' }
    }
  }

  // --- Greetings ---
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower === 'yo') {
    return {
      reply:
        "Hello! I’m your AnonymousX assistant. I can help you:\n" +
        "• Sell gift cards\n• Sell or buy crypto\n• Check live rates\n• Track transactions\n\n" +
        "Just tell me what you need — e.g. “Sell $100 Apple Gift Card” or “USDT rate”.",
    }
  }

  // Default
  return {
    reply:
      "I can help you sell gift cards, trade crypto, check rates, or track a transaction. " +
      "Try saying “Sell my Apple Gift Card”, “What’s the USDT rate?”, or “Track AX-XXXX”.",
  }
}

export const chatService = {
  async getOrCreateConversation(params: {
    userId?: string
    channel?: string
    externalId?: string
  }) {
    const channel = params.channel || 'web'

    if (params.userId) {
      const existing = await prisma.conversation.findFirst({
        where: {
          userId: params.userId,
          channel,
          status: 'active',
        },
        orderBy: { updatedAt: 'desc' },
      })
      if (existing) return existing
    }

    return prisma.conversation.create({
      data: {
        userId: params.userId || null,
        channel,
        externalId: params.externalId || null,
        status: 'active',
      },
    })
  },

  async getMessages(conversationId: string, userId?: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      throw new AppError('Conversation not found', 404)
    }

    if (userId && conversation.userId && conversation.userId !== userId) {
      throw new AppError('Not authorized', 403)
    }

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })
  },

  async sendMessage(params: {
    conversationId?: string
    userId?: string
    content: string
    channel?: string
  }) {
    const content = params.content?.trim()
    if (!content) {
      throw new AppError('Message content is required', 400)
    }

    let conversationId = params.conversationId

    if (!conversationId) {
      const conv = await this.getOrCreateConversation({
        userId: params.userId,
        channel: params.channel || 'web',
      })
      conversationId = conv.id
    }

    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content,
      },
    })

    // Prefer OpenAI when configured; fall back to rule-based assistant
    let reply: string
    let transaction: unknown = null

    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    })

    const aiMessages = history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
    // current user message already saved above – include it
    aiMessages.push({ role: 'user', content })

    const aiResult = await aiService.chat({
      messages: aiMessages,
      userId: params.userId,
      conversationId,
    })

    if (aiResult?.reply) {
      reply = aiResult.reply
      transaction = aiResult.transaction ?? null
    } else {
      const fallback = await generateReply(content, {
        userId: params.userId,
        conversationId,
      })
      reply = fallback.reply
      transaction = fallback.transaction ?? null
    }

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: reply,
        metadata: transaction ? { transaction } : undefined,
      },
    })

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return {
      conversationId,
      userMessage,
      assistantMessage,
      transaction: transaction || null,
    }
  },

  async listConversations(userId: string) {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })
  },
}
