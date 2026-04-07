import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

const cards = [
  {
    to: '/dashboard/deals',
    title: 'Funding deals',
    desc: 'Browse admin-posted company goals and submit your offer.',
  },
  {
    to: '/dashboard/create',
    title: 'Create funding request',
    desc: 'Choose a company and submit an amount for review.',
  },
  {
    to: '/dashboard/requests',
    title: 'My requests',
    desc: 'Track pending, approved, and rejected submissions.',
  },
  {
    to: '/dashboard/campaigns',
    title: 'Approved campaigns',
    desc: 'See requests that were approved and are ready to support.',
  },
]

export function DonorHomePage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <p className="text-slate-600">
        Signed in as{' '}
        <span className="font-medium text-slate-900">{user?.name}</span>. Pick
        an action below or use the tabs above.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-900">{c.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{c.desc}</p>
            <p className="mt-4 text-sm font-medium text-teal-700 group-hover:underline">
              Open →
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
