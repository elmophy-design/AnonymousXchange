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

const URL_RE = /(https?:\/\/[^\s]+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s]*)?)/gi

function extractImages(content: string, explicit?: string): string[] {
  const urls: string[] = []
  if (explicit) urls.push(explicit)
  const matches = content.match(URL_RE)
  if (matches) {
    for (const m of matches) {
      if (!urls.includes(m)) urls.push(m)
    }
  }
  return urls
}

function stripImageUrls(content: string): string {
  return content.replace(URL_RE, '').replace(/\n{2,}/g, '\n').trim()
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'
  const images = extractImages(message.content, message.imageUrl)
  const text = stripImageUrls(message.content)

  return (
    <div
      className={cn(
        'flex w-full gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
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

      <div className={cn('max-w-[min(85%,28rem)] space-y-2', isUser ? 'items-end' : 'items-start')}>
        {text && (
          <div
            className={cn(
              'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap',
              isUser
                ? 'rounded-br-md bg-blue-600 text-white'
                : 'rounded-bl-md border border-white/10 bg-white/10 text-slate-100 backdrop-blur-sm'
            )}
          >
            {text}
          </div>
        )}

        {images.map((src) => (
          <div
            key={src}
            className="overflow-hidden rounded-xl border border-white/10 bg-black/20"
          >
            <img
              src={src}
              alt="Attachment"
              className="max-h-56 w-full object-contain"
              loading="lazy"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        ))}

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
