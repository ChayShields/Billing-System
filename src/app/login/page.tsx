import { login } from "./actions"
import { buttonClasses } from "@/components/ui/Button"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
            <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
              <rect x="4" y="3" width="12" height="14" rx="1.5" />
              <path d="M7 7h6M7 10h6M7 13h3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="mt-4 text-lg font-semibold tracking-tight text-ink">Billing System</h1>
          <p className="mt-1 text-sm text-ink-soft">Sign in to continue.</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          {error && (
            <p className="mb-4 rounded-lg bg-status-overdue-bg px-3 py-2 text-sm text-status-overdue-text">
              {error}
            </p>
          )}

          <form action={login} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <button type="submit" className={buttonClasses("primary", "mt-2 w-full")}>
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
