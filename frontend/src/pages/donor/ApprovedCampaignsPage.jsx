import { useCallback, useEffect, useMemo, useState } from 'react'
import { RequestStatusBadge } from '../../components/RequestStatusBadge'
import { Spinner } from '../../components/Spinner'
import * as requestService from '../../services/requestService'
import { formatCurrency } from '../../utils/formatCurrency'

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function ApprovedCampaignsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await requestService.fetchMyRequests()
      setRequests(data.requests ?? [])
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          'Could not load your campaigns.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const approved = useMemo(
    () => requests.filter((r) => r.status === 'approved'),
    [requests]
  )

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner className="h-10 w-10" label="Loading campaigns" />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        role="alert"
      >
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Approved campaigns
        </h2>
        <p className="text-sm text-slate-600">
          Your requests that admins have approved. Other statuses stay under{' '}
          <span className="font-medium text-slate-800">My requests</span>.
        </p>
      </div>

      {approved.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No approved campaigns yet. When an admin approves a submission, it
          will appear here.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {approved.map((row) => (
            <li
              key={row.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{row.title}</h3>
                <RequestStatusBadge status={row.status} />
              </div>
              <p className="mt-2 text-sm font-medium text-teal-800">
                {row.company?.name ?? 'Company'}
              </p>
              <p className="mt-3 line-clamp-3 flex-1 text-sm text-slate-600">
                {row.description?.trim()
                  ? row.description
                  : 'No description provided.'}
              </p>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-2 border-t border-slate-100 pt-4">
                <p className="text-lg font-semibold tabular-nums text-slate-900">
                  {formatCurrency(row.amount)}
                </p>
                <p className="text-xs text-slate-500">
                  Approved flow · submitted {formatDate(row.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
