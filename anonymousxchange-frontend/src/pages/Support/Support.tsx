export default function Support() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white">Support</h1>
      <p className="mt-2 text-slate-400">
        Need help? Chat with our AI assistant or reach our support team.
      </p>
      <div className="mt-8 space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h3 className="font-semibold text-white">AI Assistant</h3>
          <p className="mt-1 text-sm text-slate-400">
            Available 24/7 on the website, Telegram, and WhatsApp.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h3 className="font-semibold text-white">Human Support</h3>
          <p className="mt-1 text-sm text-slate-400">
            For complex issues, our team is available during business hours.
          </p>
        </div>
      </div>
    </div>
  )
}
