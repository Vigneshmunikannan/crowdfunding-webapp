import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const roleOptions = [
  {
    value: 'donor',
    title: 'Donor',
    description: 'Submit funding requests and track approvals.',
  },
  {
    value: 'admin',
    title: 'Admin',
    description: 'Manage companies and review all funding requests.',
  },
]

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('donor')
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFieldErrors({})
    setSubmitting(true)
    try {
      const data = await authService.register({
        name,
        email,
        password,
        role,
      })
      login(data.token, data.user)
      const dest = data.user?.role === 'admin' ? '/admin' : '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      const { message, fieldErrors: fe } = parseApiError(err)
      setFormError(message)
      setFieldErrors(fe)
    } finally {
      setSubmitting(false)
    }
  }

  const nameErr = fieldErrorList(fieldErrors, 'name')
  const emailErr = fieldErrorList(fieldErrors, 'email')
  const passwordErr = fieldErrorList(fieldErrors, 'password')
  const roleErr = fieldErrorList(fieldErrors, 'role')

  return (
    <div className="space-y-8">
      <div className="text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
          Get started
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Create account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose whether you are registering as a donor or an admin, then sign
          in automatically.
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

        <fieldset>
          <legend className="text-sm font-medium text-slate-700">
            Account type
          </legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {roleOptions.map((opt) => {
              const selected = role === opt.value
              return (
                <label
                  key={opt.value}
                  className={[
                    'relative flex cursor-pointer flex-col rounded-xl border-2 p-4 text-left transition-colors',
                    selected
                      ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={selected}
                    onChange={() => setRole(opt.value)}
                    className="sr-only"
                  />
                  <span className="font-semibold text-slate-900">
                    {opt.title}
                  </span>
                  <span className="mt-1 text-xs text-slate-600">
                    {opt.description}
                  </span>
                </label>
              )
            })}
          </div>
          {roleErr.length > 0 ? (
            <ul className="mt-2 space-y-0.5 text-sm text-red-600">
              {roleErr.map((m, i) => (
                <li key={`role-${i}`}>{m}</li>
              ))}
            </ul>
          ) : null}
        </fieldset>

        <div>
          <label
            htmlFor="reg-name"
            className="text-sm font-medium text-slate-700"
          >
            Full name
          </label>
          <input
            id="reg-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={nameErr.length > 0}
            className={inputClass(nameErr.length > 0)}
            placeholder="Jane Doe"
          />
          {nameErr.length > 0 ? (
            <ul className="mt-1.5 space-y-0.5 text-sm text-red-600">
              {nameErr.map((m, i) => (
                <li key={`name-${i}`}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="reg-email"
            className="text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            id="reg-email"
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
            htmlFor="reg-password"
            className="text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            id="reg-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={passwordErr.length > 0}
            className={inputClass(passwordErr.length > 0)}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            At least 8 characters (same rule as the server).
          </p>
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
          {submitting ? 'Creating account…' : 'Register & sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Already registered?{' '}
        <Link
          to="/login"
          className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
