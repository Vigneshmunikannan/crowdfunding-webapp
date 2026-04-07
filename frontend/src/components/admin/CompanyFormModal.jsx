import { useEffect, useState } from 'react'
import { parseApiError } from '../../utils/apiError'

const emptyForm = { name: '', description: '', contactEmail: '' }

/**
 * @param {{
 *   open: boolean
 *   mode: 'create' | 'edit'
 *   initial?: { name?: string; description?: string; contactEmail?: string } | null
 *   onClose: () => void
 *   onSubmit: (values: typeof emptyForm) => Promise<void>
 * }} props
 */
export function CompanyFormModal({ open, mode, initial, onClose, onSubmit }) {
  const [values, setValues] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setFormError('')
    if (mode === 'edit' && initial) {
      setValues({
        name: initial.name ?? '',
        description: initial.description ?? '',
        contactEmail: initial.contactEmail ?? '',
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
      aria-labelledby="company-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2
          id="company-modal-title"
          className="text-lg font-semibold text-slate-900"
        >
          {mode === 'create' ? 'Add company' : 'Edit company'}
        </h2>
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
            <label htmlFor="co-name" className="text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="co-name"
              required
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div>
            <label htmlFor="co-email" className="text-sm font-medium text-slate-700">
              Contact email
            </label>
            <input
              id="co-email"
              type="email"
              required
              value={values.contactEmail}
              onChange={(e) =>
                setValues((v) => ({ ...v, contactEmail: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div>
            <label htmlFor="co-desc" className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="co-desc"
              rows={3}
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
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
              {submitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
