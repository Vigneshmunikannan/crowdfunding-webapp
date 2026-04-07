import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Spinner } from '../../components/Spinner'
import * as campaignService from '../../services/campaignService'
import * as companyService from '../../services/companyService'
import * as requestService from '../../services/requestService'
import { fieldErrorList, parseApiError } from '../../utils/apiError'
import { formatCurrency } from '../../utils/formatCurrency'

function inputClass(hasError) {
  return [
    'mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400',
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
      : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100',
  ].join(' ')
}

export function CreateRequestPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const campaignParam = searchParams.get('campaign')

  const [companies, setCompanies] = useState([])
  const [deal, setDeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [companyId, setCompanyId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const dealMode = Boolean(deal)

  const loadContext = useCallback(async () => {
    setLoadError('')
    setLoading(true)
    setDeal(null)
    try {
      if (campaignParam) {
        const { campaign } = await campaignService.fetchCampaign(campaignParam)
        setDeal(campaign)
        setCompanyId(campaign.company?.id ?? '')
      } else {
        setDeal(null)
        const data = await companyService.fetchCompanies()
        setCompanies(data.companies ?? [])
        setCompanyId('')
      }
    } catch (e) {
      setLoadError(
        e.response?.data?.message ||
          e.message ||
          (campaignParam
            ? 'This deal is not available (closed or removed).'
            : 'Could not load companies.')
      )
      setDeal(null)
    } finally {
      setLoading(false)
    }
  }, [campaignParam])

  useEffect(() => {
    loadContext()
  }, [loadContext])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFieldErrors({})
    setSubmitting(true)
    try {
      if (dealMode && deal) {
        await requestService.createFundingRequest({
          title: title.trim(),
          description: description.trim(),
          amount: Number(amount),
          campaignId: deal.id,
        })
      } else {
        await requestService.createFundingRequest({
          title: title.trim(),
          description: description.trim(),
          amount: Number(amount),
          companyId,
        })
      }
      navigate('/dashboard/requests', { replace: false })
    } catch (err) {
      const { message, fieldErrors: fe } = parseApiError(err)
      setFormError(message)
      setFieldErrors(fe)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner className="h-9 w-9" label="Loading form" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {loadError}
        </div>
        <Link
          to="/dashboard/deals"
          className="inline-flex text-sm font-medium text-teal-700 hover:underline"
        >
          ← Back to funding deals
        </Link>
      </div>
    )
  }

  const titleErr = fieldErrorList(fieldErrors, 'title')
  const amountErr = fieldErrorList(fieldErrors, 'amount')
  const companyErr = fieldErrorList(fieldErrors, 'companyId')
  const campaignErr = fieldErrorList(fieldErrors, 'campaignId')
  const descErr = fieldErrorList(fieldErrors, 'description')

  const canSubmit = dealMode || companies.length > 0

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {dealMode ? 'Submit for this deal' : 'New funding request'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {dealMode
            ? 'Your offer will be reviewed like any other funding request.'
            : 'Select a company and describe what you are requesting funds for.'}
        </p>
      </div>

      {dealMode && deal ? (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/60 px-4 py-3 text-sm text-teal-950">
          <p className="font-semibold">{deal.title}</p>
          <p className="mt-1 text-teal-800">
            {deal.company?.name} · Goal{' '}
            <span className="font-semibold tabular-nums">
              {formatCurrency(deal.goalAmount)}
            </span>
          </p>
          <Link
            to="/dashboard/deals"
            className="mt-2 inline-block text-xs font-medium text-teal-800 underline"
          >
            Choose a different deal
          </Link>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {formError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {formError}
          </div>
        ) : null}
        {campaignErr.length > 0 ? (
          <ul className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {campaignErr.map((m, i) => (
              <li key={`camp-${i}`}>{m}</li>
            ))}
          </ul>
        ) : null}

        <div>
          <span className="text-sm font-medium text-slate-700">Company</span>
          {dealMode && deal ? (
            <div className="mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800">
              {deal.company?.name ?? '—'}
            </div>
          ) : (
            <>
              <select
                id="req-company"
                name="companyId"
                required
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                aria-invalid={companyErr.length > 0}
                className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-slate-900 outline-none ${
                  companyErr.length
                    ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                }`}
              >
                <option value="">Select a company…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {companyErr.length > 0 ? (
                <ul className="mt-1.5 space-y-0.5 text-sm text-red-600">
                  {companyErr.map((m, i) => (
                    <li key={`c-${i}`}>{m}</li>
                  ))}
                </ul>
              ) : null}
              {companies.length === 0 ? (
                <p className="mt-2 text-sm text-amber-800">
                  No companies available yet. Ask an admin to add organizations
                  first.
                </p>
              ) : null}
            </>
          )}
        </div>

        <div>
          <label
            htmlFor="req-title"
            className="text-sm font-medium text-slate-700"
          >
            Title
          </label>
          <input
            id="req-title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={titleErr.length > 0}
            className={inputClass(titleErr.length > 0)}
            placeholder="Short summary of your request"
          />
          {titleErr.length > 0 ? (
            <ul className="mt-1.5 space-y-0.5 text-sm text-red-600">
              {titleErr.map((m, i) => (
                <li key={`t-${i}`}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="req-amount"
            className="text-sm font-medium text-slate-700"
          >
            Your amount (USD)
          </label>
          <input
            id="req-amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={amountErr.length > 0}
            className={inputClass(amountErr.length > 0)}
            placeholder="0.00"
          />
          {amountErr.length > 0 ? (
            <ul className="mt-1.5 space-y-0.5 text-sm text-red-600">
              {amountErr.map((m, i) => (
                <li key={`a-${i}`}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="req-desc"
            className="text-sm font-medium text-slate-700"
          >
            Description{' '}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="req-desc"
            name="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-invalid={descErr.length > 0}
            className={`mt-1.5 w-full resize-y rounded-xl border px-3.5 py-2.5 outline-none ${
              descErr.length
                ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
            }`}
            placeholder="Context, timeline, or how funds will be used…"
          />
          {descErr.length > 0 ? (
            <ul className="mt-1.5 space-y-0.5 text-sm text-red-600">
              {descErr.map((m, i) => (
                <li key={`d-${i}`}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit request'}
        </button>
      </form>
    </div>
  )
}
