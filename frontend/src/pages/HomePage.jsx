import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function HomePage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Crowdfunding platform
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Donors submit funding requests; admins review companies and requests.
          Sign in to continue.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <>
              {user?.role === 'donor' && (
                <Link
                  to="/dashboard"
                  className="inline-flex rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  Dashboard
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="inline-flex rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  Admin dashboard
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
