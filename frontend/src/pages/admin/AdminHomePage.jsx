import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from '../../components/Spinner'
import * as campaignService from '../../services/campaignService'
import * as companyService from '../../services/companyService'
import * as requestService from '../../services/requestService'

export function AdminHomePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [counts, setCounts] = useState({
    companies: 0,
    requests: 0,
    opportunities: 0,
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError('')
      setLoading(true)
      try {
        const [co, req, camp] = await Promise.all([
          companyService.fetchCompanies(),
          requestService.fetchAllRequests(),
          campaignService.fetchCampaignsAdmin(),
        ])
        if (!cancelled) {
          setCounts({
            companies: co.companies?.length ?? 0,
            requests: req.requests?.length ?? 0,
            opportunities: camp.campaigns?.length ?? 0,
          })
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message ||
              e.message ||
              'Could not load dashboard data.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner className="h-10 w-10" label="Loading dashboard" />
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

  const cards = [
    {
      label: 'Companies',
      value: counts.companies,
      to: '/admin/companies',
      hint: 'Create and manage organizations',
    },
    {
      label: 'Funding requests',
      value: counts.requests,
      to: '/admin/requests',
      hint: 'Review and update request status',
    },
    {
      label: 'Funding deals posted',
      value: counts.opportunities,
      to: '/admin/opportunities',
      hint: 'Set company goals donors can respond to',
    },
  ]

  return (
    <div className="space-y-6">
      <p className="text-slate-600">
        Quick snapshot of platform activity. Use the tabs above to manage data.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
              {c.value}
            </p>
            <p className="mt-3 text-sm text-teal-700 group-hover:underline">
              {c.hint} →
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
