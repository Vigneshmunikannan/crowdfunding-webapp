import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center sm:p-8">
      <h1 className="text-xl font-semibold text-amber-900">Access denied</h1>
      <p className="mt-2 text-sm text-amber-800">
        You do not have permission to view this page.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
      >
        Back to home
      </Link>
    </div>
  )
}
