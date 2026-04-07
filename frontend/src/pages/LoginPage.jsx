import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import * as authService from '../services/authService'
import { fieldErrorList, parseApiError } from '../utils/apiError'

function inputClass(hasError) {
  return [
    'mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400',
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
      : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100',
  ].join(' ')
}

function resolvePostLoginPath(user, fromPathname) {
  const role = user?.role
  if (role === 'admin') {
    if (fromPathname?.startsWith('/admin')) return fromPathname
    return '/admin'
  }
  if (role === 'donor') {
    if (
      fromPathname?.startsWith('/dashboard') ||
      fromPathname?.startsWith('/donor')
    ) {
      return fromPathname.startsWith('/donor') ? '/dashboard' : fromPathname
    }
    return '/dashboard'
  }
  return '/'
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from?.pathname

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFieldErrors({})
    setSubmitting(true)
    try {
      const data = await authService.login({ email, password })
      login(data.token, data.user)
      const dest = resolvePostLoginPath(data.user, from)
      navigate(dest, { replace: true })
    } catch (err) {
      const { message, fieldErrors: fe } = parseApiError(err)
      setFormError(message)
      setFieldErrors(fe)
    } finally {
      setSubmitting(false)
    }
  }

  const emailErr = fieldErrorList(fieldErrors, 'email')
  const passwordErr = fieldErrorList(fieldErrors, 'password')

  return (
    <div className="space-y-8">
      <div className="text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
          Welcome back
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Donor or admin account — you will be redirected to the right place.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            {formError}
          </div>
        ) : null}

        <div>
          <label
            htmlFor="login-email"
            className="text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={emailErr.length > 0}
            className={inputClass(emailErr.length > 0)}
            placeholder="you@example.com"
          />
          {emailErr.length > 0 ? (
            <ul className="mt-1.5 space-y-0.5 text-sm text-red-600">
              {emailErr.map((m, i) => (
                <li key={`email-${i}`}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={passwordErr.length > 0}
            className={inputClass(passwordErr.length > 0)}
          />
          {passwordErr.length > 0 ? (
            <ul className="mt-1.5 space-y-0.5 text-sm text-red-600">
              {passwordErr.map((m, i) => (
                <li key={`password-${i}`}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        No account?{' '}
        <Link
          to="/register"
          className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
