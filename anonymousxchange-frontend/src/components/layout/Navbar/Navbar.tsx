import { Link, NavLink } from 'react-router-dom'
import { Home, LineChart, LayoutDashboard, LifeBuoy, LogIn, LogOut, Shield } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import { logout } from '../../../store/slices/authSlice'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/rates', label: 'Rates', icon: LineChart },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/support', label: 'Support', icon: LifeBuoy },
]

export default function Navbar() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const isAdmin = (user as { role?: string })?.role === 'admin'

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            AX
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            Anonymous<span className="text-blue-400">X</span>change
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-blue-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-amber-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Shield className="h-4 w-4" />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-400 sm:block">
                {user?.firstName || user?.email || 'Account'}
              </span>
              <button
                onClick={() => dispatch(logout())}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/5"
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
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-500"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
