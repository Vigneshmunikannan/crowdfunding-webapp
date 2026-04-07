import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RequestStatusBadge } from '../../components/RequestStatusBadge'
import { Spinner } from '../../components/Spinner'
import * as requestService from '../../services/requestService'
import { formatCurrency } from '../../utils/formatCurrency'

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function MyRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (opts = { silent: false }) => {
    setError('')
    if (opts.silent) setRefreshing(true)
    else setLoading(true)
    try {
      const data = await requestService.fetchMyRequests()
      setRequests(data.requests ?? [])
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          'Could not load your requests.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load({ silent: false })
  }, [load])

  if (loading && requests.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner className="h-10 w-10" label="Loading your requests" />
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">My requests</h2>
          <p className="text-sm text-slate-600">
            Only requests you have submitted are shown here.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load({ silent: true })}
          disabled={refreshing}
          className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {refreshing ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <Spinner className="h-8 w-8" label="Refreshing" />
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Title</th>
                <th className="hidden px-4 py-3 sm:table-cell">Company</th>
                <th className="hidden px-4 py-3 lg:table-cell">Deal</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 md:table-cell">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    You have not submitted any requests yet.{' '}
                    <Link
                      to="/dashboard/create"
                      className="font-medium text-teal-700 hover:underline"
                    >
                      Create one
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                requests.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="max-w-[220px] truncate sm:max-w-xs">
                        {row.title}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500 sm:hidden">
                        {row.company?.name ?? '—'}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                      {row.company?.name ?? '—'}
                    </td>
                    <td className="hidden max-w-[160px] px-4 py-3 text-slate-600 lg:table-cell">
                      <span className="line-clamp-2 text-sm">
                        {row.campaign?.title ?? '—'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-800">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <RequestStatusBadge status={row.status} />
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-slate-600 md:table-cell">
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
