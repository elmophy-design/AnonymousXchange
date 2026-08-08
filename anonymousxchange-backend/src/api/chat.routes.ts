import { Router, Response, NextFunction } from 'express'
import { chatController } from '../controllers/chat.controller'
import { streamMessage } from '../controllers/chat.stream.controller'
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'
import { chatLimiter } from '../middleware/rateLimit.middleware'
import { validateBody, schemas } from '../middleware/validate.middleware'

const router = Router()

router.post('/messages/stream', chatLimiter, optionalAuth, streamMessage)

router.post(
  '/messages',
  chatLimiter,
  optionalAuth,
  validateBody(schemas.chatMessage),
  chatController.sendMessage
)
router.post('/conversations', optionalAuth, chatController.createConversation)
router.get('/conversations', authenticate, chatController.getConversations)
router.get('/conversations/:id/messages', authenticate, chatController.getMessages)

router.post(
  '/upload',
  chatLimiter,
  optionalAuth,
  upload.single('file'),
  (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' })
      }
      const url = `/uploads/${req.file.filename}`
      res.status(201).json({
        success: true,
        data: { url, filename: req.file.filename },
      })
    } catch (e) {
      next(e)
    }
  }
)

export default router
