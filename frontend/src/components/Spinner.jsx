export function Spinner({ className = 'h-8 w-8', label = 'Loading' }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 text-slate-500"
      role="status"
      aria-label={label}
    >
      <div
        className={`${className} animate-spin rounded-full border-2 border-slate-200 border-t-teal-600`}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
