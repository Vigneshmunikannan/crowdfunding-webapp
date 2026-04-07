import { useCallback, useEffect, useState } from 'react'
import { CompanyFormModal } from '../../components/admin/CompanyFormModal'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog'
import { Spinner } from '../../components/Spinner'
import * as companyService from '../../services/companyService'
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

export function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [listError, setListError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editing, setEditing] = useState(null)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadCompanies = useCallback(async (opts = { silent: false }) => {
    setListError('')
    if (opts.silent) setRefreshing(true)
    else setLoading(true)
    try {
      const data = await companyService.fetchCompanies()
      setCompanies(data.companies ?? [])
    } catch (e) {
      setListError(
        e.response?.data?.message || e.message || 'Failed to load companies.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

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
      await companyService.createCompany({
        name: values.name.trim(),
        description: values.description.trim(),
        contactEmail: values.contactEmail.trim(),
      })
    } else if (editing) {
      await companyService.updateCompany(editing.id, {
        name: values.name.trim(),
        description: values.description.trim(),
        contactEmail: values.contactEmail.trim(),
      })
    }
    await loadCompanies({ silent: true })
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await companyService.deleteCompany(deleteTarget.id)
      setDeleteTarget(null)
      await loadCompanies({ silent: true })
    } catch (e) {
      alert(parseApiError(e).message)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading && companies.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Spinner className="h-10 w-10" label="Loading companies" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Companies</h2>
          <p className="text-sm text-slate-600">
            Organizations donors can attach funding requests to.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          Add company
        </button>
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
                <th className="px-4 py-3">Name</th>
                <th className="hidden px-4 py-3 md:table-cell">Contact</th>
                <th className="hidden px-4 py-3 lg:table-cell">Created by</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No companies yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                companies.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>{row.name}</div>
                      <div className="mt-0.5 text-xs font-normal text-slate-500 md:hidden">
                        {row.contactEmail}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                      {row.contactEmail}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">
                      {row.createdBy?.name ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
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

      <CompanyFormModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete company"
        message={
          deleteTarget
            ? `Remove “${deleteTarget.name}”? This cannot be undone.`
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
