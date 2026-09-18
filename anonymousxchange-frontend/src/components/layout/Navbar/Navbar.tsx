import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  LineChart,
  LayoutDashboard,
  LifeBuoy,
  LogIn,
  LogOut,
  Shield,
  Menu,
  X,
  User,
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import { logout } from '../../../store/slices/authSlice'
import { authApi } from '../../../api/auth'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/rates', label: 'Rates', icon: LineChart },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/support', label: 'Support', icon: LifeBuoy },
]

export default function Navbar() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const location = useLocation()
  const isAdmin = (user as { role?: string })?.role === 'admin'
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } finally {
      dispatch(logout())
      setMobileOpen(false)
    }
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-white/10 text-blue-400'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            AX
          </span>
          <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Anonymous<span className="text-blue-400">X</span>change
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              <Shield className="h-4 w-4" />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/account"
                className="hidden items-center gap-1.5 text-sm text-slate-300 hover:text-white sm:flex"
              >
                <User className="h-4 w-4" />
                {user?.firstName || user?.email || 'Account'}
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="hidden items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/5 md:flex"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white sm:flex"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>
              <Link
                to="/register"
                className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-500 sm:inline-flex"
              >
                Get Started
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition hover:bg-white/5 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(100%,20rem)] flex-col border-l border-white/10 bg-slate-950 shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <span className="text-sm font-semibold text-white">Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <Shield className="h-4 w-4" />
              Admin
            </NavLink>
          )}

          <div className="my-3 border-t border-white/10" />

          {isAuthenticated ? (
            <>
              <NavLink to="/account" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                <User className="h-4 w-4" />
                {user?.firstName || user?.email || 'Account'}
              </NavLink>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-300 transition hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-500"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        <p className="border-t border-white/10 px-4 py-3 text-center text-[11px] text-slate-500">
          AnonymousXchange · Secure trading
        </p>
      </div>
    </header>
  )
}
