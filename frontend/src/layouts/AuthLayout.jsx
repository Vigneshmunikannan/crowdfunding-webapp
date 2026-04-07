import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-[calc(100dvh-5rem)] items-center justify-center py-10 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100/80 via-slate-50 to-slate-50"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-sm sm:p-9">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
