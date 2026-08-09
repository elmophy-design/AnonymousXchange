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
