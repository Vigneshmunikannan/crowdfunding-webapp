import { useCallback, useEffect, useState } from 'react'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog'
import { RequestStatusBadge } from '../../components/RequestStatusBadge'
import { Spinner } from '../../components/Spinner'
import * as requestService from '../../services/requestService'
import { parseApiError } from '../../utils/apiError'
import { formatCurrency } from '../../utils/formatCurrency'

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export function AdminRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [listError, setListError] = useState('')
  const [actionId, setActionId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadRequests = useCallback(async (opts = { silent: false }) => {
    setListError('')
    if (opts.silent) setRefreshing(true)
    else setLoading(true)
    try {
      const data = await requestService.fetchAllRequests()
      setRequests(data.requests ?? [])
    } catch (e) {
      setListError(
        e.response?.data?.message || e.message || 'Failed to load requests.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  async function setStatus(id, status) {
    setActionId(`${id}-${status}`)
    try {
      await requestService.updateRequestStatus(id, status)
      await loadRequests({ silent: true })
    } catch (e) {
      alert(parseApiError(e).message)
    } finally {
      setActionId(null)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await requestService.deleteRequest(deleteTarget.id)
      setDeleteTarget(null)
      await loadRequests({ silent: true })
    } catch (e) {
      alert(parseApiError(e).message)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading && requests.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Spinner className="h-10 w-10" label="Loading requests" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Funding requests
        </h2>
        <p className="text-sm text-slate-600">
          Approve or reject submissions; delete invalid or obsolete rows.
        </p>
      </div>

      {listError ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {listError}
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {refreshing ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <Spinner className="h-8 w-8" label="Refreshing list" />
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Title</th>
                <th className="hidden px-4 py-3 sm:table-cell">Company</th>
                <th className="hidden px-4 py-3 md:table-cell">Posted deal</th>
                <th className="hidden px-4 py-3 lg:table-cell">Donor</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 xl:table-cell">Submitted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No funding requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((row) => {
                  const busyApprove = actionId === `${row.id}-approved`
                  const busyReject = actionId === `${row.id}-rejected`
                  const rowBusy = busyApprove || busyReject
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="max-w-[200px] truncate sm:max-w-xs">
                          {row.title}
                        </div>
                        <div className="mt-0.5 text-xs font-normal text-slate-500 sm:hidden">
                          {row.company?.name ?? '—'}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                        {row.company?.name ?? '—'}
                      </td>
                      <td className="hidden max-w-[140px] px-4 py-3 text-slate-600 md:table-cell">
                        <span className="line-clamp-2 text-sm">
                          {row.campaign?.title ?? '—'}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">
                        <div>{row.donor?.name ?? '—'}</div>
                        <div className="text-xs text-slate-400">
                          {row.donor?.email}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-800">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <RequestStatusBadge status={row.status} />
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-slate-600 xl:table-cell">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {row.status === 'pending' ? (
                            <>
                              <button
                                type="button"
                                disabled={rowBusy}
                                onClick={() => setStatus(row.id, 'approved')}
                                className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {busyApprove ? '…' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                disabled={rowBusy}
                                onClick={() => setStatus(row.id, 'rejected')}
                                className="rounded-lg bg-slate-700 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                              >
                                {busyReject ? '…' : 'Reject'}
                              </button>
                            </>
                          ) : null}
                          <button
                            type="button"
                            disabled={rowBusy}
                            onClick={() => setDeleteTarget(row)}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete funding request"
        message={
          deleteTarget
            ? `Remove request “${deleteTarget.title}”? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
