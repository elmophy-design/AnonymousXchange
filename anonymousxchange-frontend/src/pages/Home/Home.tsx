import { Link } from 'react-router-dom'
import {
  Gift,
  Bitcoin,
  ShoppingCart,
  LineChart,
  Search,
  MessageCircle,
  Send,
} from 'lucide-react'
import { ChatInterface } from '../../components/chat'
import TrustSection from '../../components/home/TrustSection'

const quickActions = [
  { label: 'Sell Gift Card', description: 'Apple, Steam, Amazon…', icon: Gift },
  { label: 'Sell Crypto', description: 'BTC, USDT, ETH…', icon: Bitcoin },
  { label: 'Buy Crypto', description: 'Instant & secure', icon: ShoppingCart },
  { label: 'Check Rates', description: 'Live market rates', href: '/rates', icon: LineChart },
  { label: 'Track Transaction', description: 'Real-time status', href: '/dashboard', icon: Search },
]

export default function Home() {
  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="h-full w-full object-cover opacity-25"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -right-40 bottom-20 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur">
              <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
              AI-First Digital Asset Exchange
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Trade through conversation
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-400 sm:text-lg">
              Sell gift cards and crypto with an intelligent assistant. No complex forms —
              just tell us what you need.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <ChatInterface />
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {quickActions.map((action) => {
              const Icon = action.icon
              const content = (
                <div className="group rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur transition hover:border-blue-500/40 hover:bg-blue-500/10">
                  <Icon className="mx-auto h-6 w-6 text-blue-400 group-hover:text-blue-300" />
                  <p className="mt-2 text-sm font-semibold text-white group-hover:text-blue-300">
                    {action.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{action.description}</p>
                </div>
              )
              return action.href ? (
                <Link key={action.label} to={action.href}>
                  {content}
                </Link>
              ) : (
                <div key={action.label}>{content}</div>
              )
            })}
          </div>

          <div className="mx-auto mt-16 max-w-2xl text-center">
            <p className="text-sm font-medium text-slate-400">
              Same experience on every channel
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {[
                { label: 'Website AI', icon: MessageCircle },
                { label: 'Telegram', icon: Send },
                { label: 'WhatsApp', icon: MessageCircle },
              ].map((ch) => (
                <span
                  key={ch.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300"
                >
                  <ch.icon className="h-3.5 w-3.5" />
                  {ch.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TrustSection />
    </>
  )
}
