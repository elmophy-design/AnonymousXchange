import { Response, NextFunction } from 'express'
import OpenAI from 'openai'
import { config } from '../config'
import { AuthRequest } from '../middleware/auth.middleware'
import { chatService } from '../services/chat.service'
import { AppError } from '../middleware/error.middleware'
import { prisma } from '../config/database'
import { ratesService } from '../services/rates.service'

export async function streamMessage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const content = String(req.body?.content || '').trim()
    if (!content) throw new AppError('Message content is required', 400)

    let conversationId = req.body?.conversationId as string | undefined
    if (!conversationId) {
      const conv = await chatService.getOrCreateConversation({
        userId: req.user?.id,
        channel: 'web',
      })
      conversationId = conv.id
    }

    await prisma.message.create({
      data: { conversationId, role: 'user', content },
    })

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    if (typeof (res as any).flushHeaders === 'function') {
      ;(res as any).flushHeaders()
    }

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    }

    send('meta', { conversationId })

    // --- OpenAI streaming ---
    if (config.openai.apiKey) {
      const openai = new OpenAI({ apiKey: config.openai.apiKey })
      const history = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: 20,
      })

      const stream = await openai.chat.completions.create({
        model: config.openai.model || 'gpt-4o-mini',
        stream: true,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              'You are AnonymousX Assistant for gift cards and crypto exchange in Nigeria. Be concise and helpful. Use ₦ for money.',
          },
          ...history.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ],
      })

      let full = ''
      for await (const part of stream) {
        const token = part.choices[0]?.delta?.content || ''
        if (token) {
          full += token
          send('token', { text: token })
        }
      }

      const assistantMessage = await prisma.message.create({
        data: { conversationId, role: 'assistant', content: full },
      })

      send('done', { conversationId, assistantMessage })
      return res.end()
    }

    // --- Fallback non-LLM reply (simple + rates aware) ---
    let reply =
      "I can help with rates, selling gift cards/crypto, or tracking a transaction. Try “USDT rate” or “Sell $50 Apple Gift Card”."
    const lower = content.toLowerCase()
    if (lower.includes('rate') || lower.includes('usdt') || lower.includes('btc')) {
      try {
        const rates = await ratesService.getAll()
        reply = ratesService.formatForChat(rates)
      } catch {
        reply = 'Rates are temporarily unavailable.'
      }
    }

    for (const chunk of reply.match(/.{1,20}/g) || [reply]) {
      send('token', { text: chunk })
      await new Promise((r) => setTimeout(r, 15))
    }

    const assistantMessage = await prisma.message.create({
      data: { conversationId, role: 'assistant', content: reply },
    })

    send('done', { conversationId, assistantMessage })
    res.end()
  } catch (error) {
    if (!res.headersSent) return next(error)
    res.write(
      `event: error\ndata: ${JSON.stringify({ message: 'Stream failed' })}\n\n`
    )
    res.end()
  }
}
