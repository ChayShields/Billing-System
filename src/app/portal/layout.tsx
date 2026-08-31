import { requireCustomer } from "@/lib/auth"
import { logout } from "@/app/login/actions"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await requireCustomer()

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
              <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
                <rect x="4" y="3" width="12" height="14" rx="1.5" />
                <path d="M7 7h6M7 10h6M7 13h3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-ink">My Invoices</span>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-ink-soft hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  )
}
