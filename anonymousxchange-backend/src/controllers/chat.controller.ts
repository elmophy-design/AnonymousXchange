import { Response, NextFunction } from 'express'
import { chatService } from '../services/chat.service'
import { AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

export const chatController = {
  async getConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('Authentication required', 401)
      }

      const conversations = await chatService.listConversations(req.user.id)

      res.status(200).json({
        success: true,
        data: conversations,
      })
    } catch (error) {
      next(error)
    }
  },

  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = asString(req.params.id)
      if (!id) {
        throw new AppError('Conversation ID is required', 400)
      }

      const messages = await chatService.getMessages(id, req.user?.id)

      res.status(200).json({
        success: true,
        data: messages,
      })
    } catch (error) {
      next(error)
    }
  },

  async createConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversation = await chatService.getOrCreateConversation({
        userId: req.user?.id,
        channel: 'web',
      })

      res.status(201).json({
        success: true,
        data: conversation,
      })
    } catch (error) {
      next(error)
    }
  },

  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { content, conversationId } = req.body

      if (!content || typeof content !== 'string') {
        throw new AppError('Message content is required', 400)
      }

      const result = await chatService.sendMessage({
        content,
        conversationId:
          typeof conversationId === 'string' ? conversationId : undefined,
        userId: req.user?.id,
        channel: 'web',
      })

      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },
}
