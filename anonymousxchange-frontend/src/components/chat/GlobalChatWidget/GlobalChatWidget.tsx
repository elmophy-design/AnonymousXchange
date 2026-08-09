import { useState, useCallback, useEffect } from 'react'
import { MessageCircle, X, Minimize2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  addMessage,
  setConversationId,
  setIsTyping,
  clearChat,
} from '../../../store/slices/chatSlice'
import { chatApi } from '../../../api/chat'
import type { ChatMessage } from '../Message/Message'
import MessageList from '../Message/MessageList'
import ChatInput from '../ChatInput/ChatInput'

export default function GlobalChatWidget() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const { messages, conversationId, isTyping } = useAppSelector((s) => s.chat)

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const sendToBackend = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      }
      dispatch(addMessage(userMsg))
      setError(null)
      dispatch(setIsTyping(true))

      try {
        const { data } = await chatApi.sendMessage({
          content: text,
          conversationId: conversationId || undefined,
        })

        const payload = data?.data ?? data
        const convId = payload?.conversationId
        const assistant = payload?.assistantMessage

        if (convId && !conversationId) {
          dispatch(setConversationId(convId))
        }

        if (assistant) {
          dispatch(
            addMessage({
              id: assistant.id || `ai-${Date.now()}`,
              role: 'assistant',
              content: assistant.content,
              createdAt: assistant.createdAt || new Date().toISOString(),
              imageUrl: assistant.imageUrl,
            })
          )
        }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ||
          (err as Error)?.message ||
          'Unable to reach the assistant.'
        setError(message)
        dispatch(
          addMessage({
            id: `ai-err-${Date.now()}`,
            role: 'assistant',
            content: 'Sorry, I had trouble connecting. Please try again.',
            createdAt: new Date().toISOString(),
          })
        )
      } finally {
        dispatch(setIsTyping(false))
      }
    },
    [dispatch, conversationId]
  )

  const handleSend = (text: string, imageUrl?: string) => {
    if ((!text.trim() && !imageUrl) || isTyping) return
    const content = imageUrl ? `${text || 'Image attached'}\n${imageUrl}` : text
    sendToBackend(content)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/40 transition hover:bg-blue-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        aria-label="Open AI chat"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex h-[min(70vh,560px)] w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-xs font-bold text-white">
            AI
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AnonymousX Assistant</p>
            <p className="text-[11px] text-emerald-400">Online · 24/7</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => dispatch(clearChat())}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            title="Clear chat"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <MessageCircle className="h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-400">
              Sell gift cards, trade crypto, or track a transaction.
            </p>
            <p className="text-xs text-slate-500">Just type what you need.</p>
          </div>
        ) : (
          <MessageList messages={messages} isTyping={isTyping} />
        )}
        {error && (
          <p className="mt-2 text-center text-xs text-red-400">{error}</p>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-3">
        <ChatInput onSend={handleSend} disabled={isTyping} compact />
      </div>
    </div>
  )
}
