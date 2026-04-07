import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from '../../components/Spinner'
import * as campaignService from '../../services/campaignService'
import * as requestService from '../../services/requestService'
import { formatCurrency } from '../../utils/formatCurrency'

export function FundingDealsPage() {
  const [openCampaigns, setOpenCampaigns] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError('')
      setLoading(true)
      try {
        const [campRes, reqRes] = await Promise.all([
          campaignService.fetchOpenCampaigns(),
          requestService.fetchMyRequests(),
        ])
        if (!cancelled) {
          setOpenCampaigns(campRes.campaigns ?? [])
          setMyRequests(reqRes.requests ?? [])
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message ||
              e.message ||
              'Could not load funding opportunities.'
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

  const campaigns = useMemo(() => {
    const approvedDealIds = new Set()
    for (const r of myRequests) {
      if (r.status === 'approved' && r.campaign?.id) {
        approvedDealIds.add(r.campaign.id)
      }
    }
    return openCampaigns.filter(
      (c) => c.status === 'open' && !approvedDealIds.has(c.id)
    )
  }, [openCampaigns, myRequests])

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner className="h-10 w-10" label="Loading deals" />
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

  const hadOpenDeals = openCampaigns.some((c) => c.status === 'open')
  const allHiddenByApproval =
    hadOpenDeals && campaigns.length === 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Open funding deals
        </h2>
        <p className="text-sm text-slate-600">
          Active opportunities you can still join. Deals you have already been{' '}
          <span className="font-medium text-slate-800">approved</span> for are
          kept under{' '}
          <Link
            to="/dashboard/campaigns"
            className="font-medium text-teal-700 hover:underline"
          >
            Approved campaigns
          </Link>
          .
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          {allHiddenByApproval ? (
            <>
              There are no new deals to join — you have already been approved
              for the current postings. View them under{' '}
              <Link
                to="/dashboard/campaigns"
                className="font-medium text-teal-700 hover:underline"
              >
                Approved campaigns
              </Link>
              .
            </>
          ) : (
            <>
              No open opportunities right now. Check back later or create a
              general request from{' '}
              <Link
                to="/dashboard/create"
                className="font-medium text-teal-700 hover:underline"
              >
                New request
              </Link>
              .
            </>
          )}
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {campaigns.map((c) => (
            <li
              key={c.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                {c.company?.name ?? 'Company'}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                {c.title}
              </h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">
                {c.description?.trim()
                  ? c.description
                  : 'No additional details.'}
              </p>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Funding goal
                  </p>
                  <p className="text-xl font-bold tabular-nums text-slate-900">
                    {formatCurrency(c.goalAmount)}
                  </p>
                </div>
                <Link
                  to={`/dashboard/create?campaign=${c.id}`}
                  className="inline-flex rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
                >
                  Submit for this deal
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
