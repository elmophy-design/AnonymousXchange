import { Shield, Zap, BadgePercent, Lock, MessageCircle, CheckCircle2 } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Bank-grade security',
    description:
      'Encrypted data at rest and in transit. We never store full card codes longer than needed to complete your trade.',
  },
  {
    icon: Zap,
    title: 'Fast payouts',
    description:
      'Most completed trades are paid within minutes during business hours. Track every step in your dashboard.',
  },
  {
    icon: BadgePercent,
    title: 'Transparent fees',
    description:
      'Clear rates shown before you confirm. No hidden charges. Crypto spreads and gift-card margins are visible upfront.',
  },
  {
    icon: MessageCircle,
    title: 'AI + human support',
    description:
      'Start on the website, Telegram, or WhatsApp. Escalate to a human agent anytime from the same conversation.',
  },
  {
    icon: Lock,
    title: 'Privacy first',
    description:
      'Trade with minimal personal data. We only ask for what is required to pay you securely.',
  },
  {
    icon: CheckCircle2,
    title: 'How it works',
    description:
      '1. Tell the AI what you want to sell or buy. 2. Confirm the rate. 3. Submit details / proof. 4. Get paid.',
  },
]

export default function TrustSection() {
  return (
    <section className="relative border-t border-white/5 bg-slate-950 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Why traders choose AnonymousXchange
          </h2>
          <p className="mt-3 text-slate-400">
            Built for speed, clarity, and trust — whether you sell gift cards or move crypto.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition hover:border-white/15 hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">Fee overview</h3>
              <p className="mt-1 text-sm text-slate-400">
                Gift cards: competitive buy rates · Crypto: tight NGN spreads · No deposit fees
              </p>
            </div>
            <a
              href="/rates"
              className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              View live rates
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
