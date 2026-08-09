import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { chatApi } from '../../api/chat'

interface ConversationPreview {
  id: string
  updatedAt: string
  status: string
  messages: Array<{ id: string; content: string; role: string; createdAt: string }>
}

export default function ChatHistoryPanel() {
  const [conversations, setConversations] = useState<ConversationPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await chatApi.getConversations()
        const payload = data?.data ?? data
        setConversations(payload ?? [])
      } catch {
        setConversations([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-400">Conversation history</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Pick up where you left off</h2>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
          <MessageCircle className="h-5 w-5" />
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Loading saved conversations…</p>
      ) : conversations.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-slate-950/50 p-5 text-sm text-slate-400">
          No saved chats yet. Start a conversation from the homepage and it will appear here.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {conversations.map((conversation) => {
            const lastMessage = conversation.messages?.[0]
            return (
              <div key={conversation.id} className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">Conversation #{conversation.id.slice(0, 6)}</p>
                  <span className="text-xs text-slate-500">{new Date(conversation.updatedAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {lastMessage?.content ? lastMessage.content : 'No messages yet'}
                </p>
                <Link to="/" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300">
                  Continue <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
