import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function navClass({ isActive }) {
  return [
    'rounded-md px-2 py-1 transition-colors',
    isActive
      ? 'bg-teal-100 font-medium text-teal-900'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')
}

export function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const { pathname } = useLocation()
  const wideLayout =
    pathname.startsWith('/admin') || pathname.startsWith('/dashboard')

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div
          className={`mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${wideLayout ? 'max-w-7xl' : 'max-w-3xl'}`}
        >
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-teal-800"
          >
            CrowdFund
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            {isAuthenticated ? (
              <>
                {user?.role === 'donor' && (
                  <NavLink to="/dashboard" className={navClass}>
                    Dashboard
                  </NavLink>
                )}
                {user?.role === 'admin' && (
                  <NavLink to="/admin" className={navClass}>
                    Admin
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="ml-1 rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>
                  Log in
                </NavLink>
                <NavLink to="/register" className={navClass}>
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main
        className={`mx-auto w-full flex-1 px-4 py-8 ${wideLayout ? 'max-w-7xl' : 'max-w-3xl'}`}
      >
        <Outlet />
      </main>
    </div>
  )
}
