import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  addMessage,
  setIsTyping,
  setConversationId,
} from '../../../store/slices/chatSlice'
import { chatApi } from '../../../api/chat'
import MessageList from '../Message/MessageList'
import ChatInput from '../ChatInput/ChatInput'
import Suggestions from '../ChatInput/Suggestions'
import type { ChatMessage } from '../Message/Message'

export default function ChatInterface() {
  const dispatch = useAppDispatch()
  const { messages, isTyping, conversationId } = useAppSelector((s) => s.chat)
  const [hasStarted, setHasStarted] = useState(messages.length > 0)
  const [error, setError] = useState<string | null>(null)

  const sendToBackend = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      }
      dispatch(addMessage(userMsg))
      setHasStarted(true)
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
          const assistantMsg: ChatMessage = {
            id: assistant.id || `ai-${Date.now()}`,
            role: 'assistant',
            content: assistant.content,
            createdAt: assistant.createdAt || new Date().toISOString(),
          }
          dispatch(addMessage(assistantMsg))
        } else {
          // Fallback if shape is unexpected
          dispatch(
            addMessage({
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: 'I received your message. How else can I help?',
              createdAt: new Date().toISOString(),
            })
          )
        }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ||
          (err as Error)?.message ||
          'Unable to reach the assistant. Please try again.'

        setError(message)
        dispatch(
          addMessage({
            id: `ai-err-${Date.now()}`,
            role: 'assistant',
            content:
              'Sorry, I had trouble connecting. Please check your connection and try again.',
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
    const content = imageUrl
      ? `${text || 'Image attached'}\n${imageUrl}`
      : text
    sendToBackend(content)
  }

  return (
    <div className="relative flex h-[min(70vh,640px)] w-full flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="h-full w-full object-cover opacity-30"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/85 to-slate-950/95" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/40 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-500/30">
              AI
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AnonymousX Assistant</p>
            <p className="text-xs text-slate-400">Online · Instant replies</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
            Secure
          </span>
          <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-medium text-blue-400">
            24/7
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {messages.length === 0 && !isTyping ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
              AX
            </div>
            <p className="font-medium text-slate-200">How can I help you today?</p>
            <p className="text-sm text-slate-400">Sell gift cards, check rates, or track a transaction</p>
          </div>
        ) : (
          <MessageList messages={messages} isTyping={isTyping} />
        )}
        {!hasStarted && <Suggestions onSelect={handleSend} />}
        {error && (
          <p className="px-4 pb-2 text-center text-xs text-red-400">{error}</p>
        )}
      </div>

      {/* Input */}
      <div className="relative z-10">
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  )
}
