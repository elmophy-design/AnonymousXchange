import OpenAI from 'openai'
import { config } from '../config'
import { logger } from '../utils/logger'
import { ratesService } from './rates.service'
import { transactionsService } from './transactions.service'

let client: OpenAI | null = null

function getClient(): OpenAI | null {
  if (!config.openai.apiKey) return null
  if (!client) {
    client = new OpenAI({ apiKey: config.openai.apiKey })
  }
  return client
}

const SYSTEM_PROMPT = `You are AnonymousX Assistant, a professional AI for a digital asset exchange (gift cards + crypto) in Nigeria.
You help users:
- Check live rates
- Sell gift cards (Apple, Steam, Amazon, etc.)
- Sell or buy crypto (BTC, USDT, ETH, etc.)
- Track transactions by reference (AX-...)

Be concise, friendly, and professional. Use Naira (₦) for money.
When the user wants to trade, collect needed details step by step.
Never invent transaction references — only use ones returned by tools.`

export const aiService = {
  isConfigured() {
    return Boolean(config.openai.apiKey)
  },

  async chat(params: {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
    userId?: string
    conversationId?: string
  }): Promise<{ reply: string; transaction?: unknown } | null> {
    const openai = getClient()
    if (!openai) {
      logger.debug('OpenAI not configured – skipping LLM')
      return null
    }

    try {
      const tools: OpenAI.Chat.ChatCompletionTool[] = [
        {
          type: 'function',
          function: {
            name: 'get_rates',
            description: 'Get current crypto and gift card rates in NGN',
            parameters: {
              type: 'object',
              properties: {
                asset: {
                  type: 'string',
                  description: 'Optional asset symbol e.g. USDT, BTC, Apple Gift Card',
                },
              },
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'create_transaction',
            description: 'Start a sell_giftcard, sell_crypto, or buy_crypto transaction',
            parameters: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['sell_giftcard', 'sell_crypto', 'buy_crypto'],
                },
                asset: { type: 'string' },
                amount: { type: 'number' },
              },
              required: ['type', 'asset'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'track_transaction',
            description: 'Look up a transaction by reference code',
            parameters: {
              type: 'object',
              properties: {
                reference: { type: 'string' },
              },
              required: ['reference'],
            },
          },
        },
      ]

      const completion = await openai.chat.completions.create({
        model: config.openai.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...params.messages,
        ],
        tools,
        tool_choice: 'auto',
        temperature: 0.4,
      })

      const choice = completion.choices[0]
      let reply = choice.message.content || ''
      let transaction: unknown

      // Handle tool calls (one round)
      if (choice.message.tool_calls?.length) {
        const toolResults: OpenAI.Chat.ChatCompletionMessageParam[] = [
          choice.message,
        ]

        for (const call of choice.message.tool_calls) {
          const name = call.function.name
          let args: Record<string, unknown> = {}
          try {
            args = JSON.parse(call.function.arguments || '{}')
          } catch {
            args = {}
          }

          let result: unknown = { ok: false }

          if (name === 'get_rates') {
            if (args.asset && typeof args.asset === 'string') {
              result = await ratesService.getOne(args.asset)
            } else {
              result = await ratesService.getAll()
            }
          } else if (name === 'create_transaction') {
            const tx = await transactionsService.create({
              userId: params.userId,
              conversationId: params.conversationId,
              type: args.type as 'sell_giftcard' | 'sell_crypto' | 'buy_crypto',
              asset: String(args.asset),
              amount: args.amount != null ? Number(args.amount) : undefined,
              details: { source: 'openai_tool' },
            })
            transaction = tx
            result = tx
          } else if (name === 'track_transaction') {
            try {
              result = await transactionsService.getByReference(
                String(args.reference),
                params.userId
              )
            } catch {
              result = { error: 'Transaction not found' }
            }
          }

          toolResults.push({
            role: 'tool',
            tool_call_id: call.id,
            content: JSON.stringify(result),
          })
        }

        const followUp = await openai.chat.completions.create({
          model: config.openai.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...params.messages,
            ...toolResults,
          ],
          temperature: 0.4,
        })

        reply = followUp.choices[0].message.content || reply
      }

      return { reply, transaction }
    } catch (error) {
      logger.error('OpenAI chat failed', error)
      return null
    }
  },
}
