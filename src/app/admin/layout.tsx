import { requireAdmin } from "@/lib/auth"
import { logout } from "@/app/login/actions"
import AdminSidebar from "@/components/AdminSidebar"

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor">
        <path d="M3 10.5 10 4l7 6.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9v7h10V9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor">
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/invoices",
    label: "Invoices",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor">
        <rect x="4" y="3" width="12" height="14" rx="1.5" />
        <path d="M7 7h6M7 10h6M7 13h3" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  const logoutForm = (
    <form action={logout}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
      >
        <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
          <path d="M7 4H4v12h3M13 14l4-4-4-4M17 10H8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Sign out
      </button>
    </form>
  )

  return (
    <div className="flex min-h-screen flex-col bg-surface-sunken md:flex-row">
      <AdminSidebar nav={NAV} logoutForm={logoutForm} />
      <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
