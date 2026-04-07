import { useCallback, useEffect, useState } from 'react'
import { CampaignFormModal } from '../../components/admin/CampaignFormModal'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog'
import { Spinner } from '../../components/Spinner'
import * as campaignService from '../../services/campaignService'
import * as companyService from '../../services/companyService'
import { formatCurrency } from '../../utils/formatCurrency'
import { parseApiError } from '../../utils/apiError'

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

function statusBadge(status) {
  const open = status === 'open'
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        open
          ? 'bg-emerald-100 text-emerald-900 ring-emerald-200'
          : 'bg-slate-100 text-slate-700 ring-slate-200'
      }`}
    >
      {open ? 'Open' : 'Closed'}
    </span>
  )
}

export function AdminOpportunitiesPage() {
  const [campaigns, setCampaigns] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [listError, setListError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadAll = useCallback(async (opts = { silent: false }) => {
    setListError('')
    if (opts.silent) setRefreshing(true)
    else setLoading(true)
    try {
      const [campRes, coRes] = await Promise.all([
        campaignService.fetchCampaignsAdmin(),
        companyService.fetchCompanies(),
      ])
      setCampaigns(campRes.campaigns ?? [])
      setCompanies(coRes.companies ?? [])
    } catch (e) {
      setListError(
        e.response?.data?.message ||
          e.message ||
          'Failed to load funding opportunities.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadAll({ silent: false })
  }, [loadAll])

  function openCreate() {
    setModalMode('create')
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(row) {
    setModalMode('edit')
    setEditing(row)
    setModalOpen(true)
  }

  async function handleModalSubmit(values) {
    if (modalMode === 'create') {
      await campaignService.createCampaign({
        companyId: values.companyId,
        title: values.title.trim(),
        description: values.description.trim(),
        goalAmount: Number(values.goalAmount),
      })
    } else if (editing) {
      await campaignService.updateCampaign(editing.id, {
        companyId: values.companyId,
        title: values.title.trim(),
        description: values.description.trim(),
        goalAmount: Number(values.goalAmount),
        status: values.status,
      })
    }
    await loadAll({ silent: true })
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await campaignService.deleteCampaign(deleteTarget.id)
      setDeleteTarget(null)
      await loadAll({ silent: true })
    } catch (e) {
      alert(parseApiError(e).message)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Spinner className="h-10 w-10" label="Loading opportunities" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Funding opportunities
          </h2>
          <p className="text-sm text-slate-600">
            Post how much a company needs; donors browse open posts and submit
            their deal.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={companies.length === 0}
          className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
        >
          Post funding need
        </button>
      </div>

      {companies.length === 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add at least one company before posting a funding opportunity.
        </p>
      ) : null}

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
            <Spinner className="h-8 w-8" label="Refreshing" />
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Headline</th>
                <th className="hidden px-4 py-3 md:table-cell">Company</th>
                <th className="px-4 py-3">Goal</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 lg:table-cell">Posted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No opportunities yet. Publish one for donors to see.
                  </td>
                </tr>
              ) : (
                campaigns.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="max-w-[200px] truncate sm:max-w-xs">
                        {row.title}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500 md:hidden">
                        {row.company?.name}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                      {row.company?.name ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums font-medium text-slate-800">
                      {formatCurrency(row.goalAmount)}
                    </td>
                    <td className="px-4 py-3">{statusBadge(row.status)}</td>
                    <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="mr-2 rounded-lg px-2 py-1 text-teal-700 hover:bg-teal-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        className="rounded-lg px-2 py-1 text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CampaignFormModal
        open={modalOpen}
        mode={modalMode}
        companies={companies}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete opportunity"
        message={
          deleteTarget
            ? `Remove “${deleteTarget.title}”? Donor submissions already linked stay in the requests list.`
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
