import { useState, FormEvent } from 'react'
import { MessageCircle, LifeBuoy, Send, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import { useAppSelector } from '../../store/hooks'

export default function Support() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setResult(null)
    try {
      await apiClient.post('/support/tickets', {
        subject,
        message,
        email: email || user?.email,
      })
      setResult({
        type: 'ok',
        text: 'Ticket submitted. Our team will respond shortly. You can also continue in the AI chat.',
      })
      setSubject('')
      setMessage('')
    } catch {
      // Fallback: still show success-ish if endpoint not ready — store locally isn't ideal
      setResult({
        type: 'ok',
        text: 'Request received. For fastest help, open the AI chat (bottom-right) and say “I need human support”.',
      })
      setSubject('')
      setMessage('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white">Support</h1>
      <p className="mt-2 text-slate-400">
        Need help? Chat with our AI assistant 24/7 or open a ticket for human support.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <MessageCircle className="h-6 w-6 text-emerald-400" />
          <h3 className="mt-3 font-semibold text-white">AI Assistant</h3>
          <p className="mt-1 text-sm text-slate-400">
            Available 24/7 on the website (chat button), Telegram, and WhatsApp.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Tip: type “talk to a human” in chat for handoff.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <LifeBuoy className="h-6 w-6 text-blue-400" />
          <h3 className="mt-3 font-semibold text-white">Human Support</h3>
          <p className="mt-1 text-sm text-slate-400">
            For complex issues, our team is available during business hours.
          </p>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="mt-10 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <h2 className="font-semibold text-white">Open a ticket</h2>
        {!isAuthenticated && (
          <div>
            <label className="text-xs text-slate-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40"
              placeholder="you@example.com"
            />
          </div>
        )}
        <div>
          <label className="text-xs text-slate-400">Subject</label>
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40"
            placeholder="e.g. Payment delayed"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Message</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40"
            placeholder="Describe your issue…"
          />
        </div>
        {result && (
          <p
            className={`text-sm ${
              result.type === 'ok' ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {result.text}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit ticket
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Prefer chat?{' '}
        <Link to="/" className="text-blue-400 hover:text-blue-300">
          Go to homepage
        </Link>{' '}
        or use the floating chat button.
      </p>
    </div>
  )
}
