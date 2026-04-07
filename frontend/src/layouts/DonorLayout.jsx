import { NavLink, Outlet } from 'react-router-dom'

function tabClass({ isActive }) {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-teal-100 text-teal-900'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')
}

export function DonorLayout() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
            Donor
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
        </div>
        <nav
          className="flex flex-wrap gap-1 rounded-xl bg-slate-100/80 p-1"
          aria-label="Donor sections"
        >
          <NavLink to="/dashboard" end className={tabClass}>
            Home
          </NavLink>
          <NavLink to="/dashboard/deals" className={tabClass}>
            Funding deals
          </NavLink>
          <NavLink to="/dashboard/create" className={tabClass}>
            New request
          </NavLink>
          <NavLink to="/dashboard/requests" className={tabClass}>
            My requests
          </NavLink>
          <NavLink to="/dashboard/campaigns" className={tabClass}>
            Approved campaigns
          </NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  )
}
