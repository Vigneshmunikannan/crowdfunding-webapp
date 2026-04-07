import { useEffect, useState } from 'react'
import { parseApiError } from '../../utils/apiError'

const emptyForm = {
  companyId: '',
  title: '',
  description: '',
  goalAmount: '',
  status: 'open',
}

/**
 * @param {{
 *   open: boolean
 *   mode: 'create' | 'edit'
 *   companies: { id: string; name: string }[]
 *   initial?: Record<string, unknown> | null
 *   onClose: () => void
 *   onSubmit: (values: typeof emptyForm) => Promise<void>
 * }} props
 */
export function CampaignFormModal({
  open,
  mode,
  companies,
  initial,
  onClose,
  onSubmit,
}) {
  const [values, setValues] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setFormError('')
    if (mode === 'edit' && initial) {
      setValues({
        companyId: initial.company?.id ?? initial.companyId ?? '',
        title: initial.title ?? '',
        description: initial.description ?? '',
        goalAmount:
          initial.goalAmount != null ? String(initial.goalAmount) : '',
        status: initial.status === 'closed' ? 'closed' : 'open',
      })
    } else {
      setValues(emptyForm)
    }
  }, [open, mode, initial])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await onSubmit(values)
      onClose()
    } catch (err) {
      setFormError(parseApiError(err).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2
          id="campaign-modal-title"
          className="text-lg font-semibold text-slate-900"
        >
          {mode === 'create' ? 'Post funding need' : 'Edit funding opportunity'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Set how much the company is looking to raise. Donors can submit deals
          against open posts.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {formError ? (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {formError}
            </p>
          ) : null}

          <div>
            <label
              htmlFor="camp-company"
              className="text-sm font-medium text-slate-700"
            >
              Company
            </label>
            <select
              id="camp-company"
              required
              value={values.companyId}
              onChange={(e) =>
                setValues((v) => ({ ...v, companyId: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Select company…</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="camp-title"
              className="text-sm font-medium text-slate-700"
            >
              Headline
            </label>
            <input
              id="camp-title"
              required
              value={values.title}
              onChange={(e) =>
                setValues((v) => ({ ...v, title: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              placeholder="e.g. Q2 expansion — $20k goal"
            />
          </div>

          <div>
            <label
              htmlFor="camp-goal"
              className="text-sm font-medium text-slate-700"
            >
              Goal amount (USD)
            </label>
            <input
              id="camp-goal"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              required
              value={values.goalAmount}
              onChange={(e) =>
                setValues((v) => ({ ...v, goalAmount: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              placeholder="20000"
            />
          </div>

          <div>
            <label
              htmlFor="camp-desc"
              className="text-sm font-medium text-slate-700"
            >
              Details
            </label>
            <textarea
              id="camp-desc"
              rows={3}
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {mode === 'edit' ? (
            <div>
              <label
                htmlFor="camp-status"
                className="text-sm font-medium text-slate-700"
              >
                Status
              </label>
              <select
                id="camp-status"
                value={values.status}
                onChange={(e) =>
                  setValues((v) => ({ ...v, status: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                <option value="open">Open — donors can submit</option>
                <option value="closed">Closed — hidden from browse</option>
              </select>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : mode === 'create' ? 'Publish' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
