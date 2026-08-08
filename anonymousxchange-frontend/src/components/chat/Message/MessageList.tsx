import { useEffect, useRef } from 'react'
import Message, { ChatMessage } from './Message'

interface MessageListProps {
  messages: ChatMessage[]
  isTyping?: boolean
}

export default function MessageList({ messages, isTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6">
      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
            AX
          </div>
          <div>
            <p className="font-medium text-slate-200">How can I help you today?</p>
            <p className="mt-1 text-sm text-slate-400">
              Sell gift cards, check rates, or track a transaction
            </p>
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}

      {isTyping && (
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-xs font-semibold text-white">
            AI
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
