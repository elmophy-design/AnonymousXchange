import { Link, useLocation } from 'react-router-dom'

const copy = {
  '/privacy': {
    title: 'Privacy',
    text: 'We use the information needed to operate your account, process trades, and keep the platform secure. We do not sell personal information.',
  },
  '/terms': {
    title: 'Terms of service',
    text: 'By using AnonymousXchange, you agree to provide accurate trade details and comply with applicable laws. Rates and transaction status are confirmed before completion.',
  },
  '/security': {
    title: 'Security',
    text: 'Use a unique password, enable two-factor authentication, and never share one-time codes. Contact support immediately if you suspect unauthorized activity.',
  },
} as const

export default function Legal() {
  const location = useLocation()
  const page = copy[location.pathname as keyof typeof copy] || copy['/privacy']

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white">{page.title}</h1>
      <p className="mt-6 leading-7 text-slate-300">{page.text}</p>
      <p className="mt-6 text-sm text-slate-400">
        Questions? <Link to="/support" className="text-blue-400 hover:text-blue-300">Contact support</Link>.
      </p>
    </div>
  )
}
