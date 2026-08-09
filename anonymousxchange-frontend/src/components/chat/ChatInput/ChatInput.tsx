import { useState, FormEvent, KeyboardEvent, useRef } from 'react'
import { Send, ImagePlus, Loader2 } from 'lucide-react'
import { cn } from '../../../utils/cn'
import apiClient from '../../../api/client'

interface ChatInputProps {
  onSend: (text: string, imageUrl?: string) => void
  disabled?: boolean
  placeholder?: string
  compact?: boolean
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Ask anything… e.g. “Sell my Apple Gift Card”',
  compact = false,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const submit = () => {
    const text = value.trim()
    if ((!text && !uploading) || disabled) return
    onSend(text)
    setValue('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await apiClient.post('/chat/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = data?.data?.url
      if (url) {
        const fullUrl = url.startsWith('http')
          ? url
          : `${import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000'}${url}`
        onSend(value.trim() || 'Here is my gift card / proof image', fullUrl)
        setValue('')
      }
    } catch {
      // silent – parent can show error via message
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const size = compact ? 'h-10 w-10' : 'h-12 w-12'
  const pad = compact ? 'p-0' : 'p-4'
  const rounded = compact ? 'rounded-xl' : 'rounded-2xl'

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        !compact && 'border-t border-white/10 bg-slate-950/50 backdrop-blur-md',
        pad
      )}
    >
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'flex shrink-0 items-center justify-center border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-40',
            size,
            rounded
          )}
          title="Upload proof / gift card image"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
          )}
        </button>
        <div className="relative flex-1">
          <textarea
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              'max-h-32 w-full resize-none border border-white/10 bg-white/5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20',
              compact ? 'rounded-xl px-3 py-2.5' : 'rounded-2xl px-4 py-3.5',
              disabled && 'opacity-60'
            )}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className={cn(
            'flex shrink-0 items-center justify-center bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40',
            size,
            rounded
          )}
          aria-label="Send message"
        >
          <Send className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </button>
      </div>
    </form>
  )
}
