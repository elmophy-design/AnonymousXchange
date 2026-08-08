import { cn } from '../../../utils/cn'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
  imageUrl?: string
}

interface MessageProps {
  message: ChatMessage
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex w-full gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-blue-500/20'
        )}
      >
        {isUser ? 'You' : 'AI'}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[min(85%,28rem)] space-y-2',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'rounded-br-md bg-blue-600 text-white'
              : 'rounded-bl-md border border-white/10 bg-white/10 text-slate-100 backdrop-blur-sm'
          )}
        >
          {message.content}
        </div>

        {message.imageUrl && (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <img
              src={message.imageUrl}
              alt="Attachment"
              className="max-h-48 w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {message.createdAt && (
          <p
            className={cn(
              'px-1 text-[11px] text-slate-500',
              isUser ? 'text-right' : 'text-left'
            )}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  )
}
