export function RequestStatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-900 ring-amber-200',
    approved: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
    rejected: 'bg-red-100 text-red-900 ring-red-200',
  }
  const s = styles[status] || 'bg-slate-100 text-slate-800 ring-slate-200'
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${s}`}
    >
      {status}
    </span>
  )
}
