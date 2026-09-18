import { Link } from 'react-router-dom'
import { Facebook, Instagram, MessageCircle, Send } from 'lucide-react'

const socialLinks = [
  { label: 'Telegram', href: import.meta.env.VITE_TELEGRAM_URL, icon: Send },
  { label: 'WhatsApp', href: import.meta.env.VITE_WHATSAPP_URL, icon: MessageCircle },
  { label: 'Instagram', href: import.meta.env.VITE_INSTAGRAM_URL, icon: Instagram },
  { label: 'Facebook', href: import.meta.env.VITE_FACEBOOK_URL, icon: Facebook },
].filter((link) => Boolean(link.href))

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} AnonymousXchange. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-300">Terms</Link>
            <Link to="/security" className="hover:text-slate-300">Security</Link>
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 transition hover:text-blue-300"
                aria-label={`Follow us on ${label}`}
                title={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
