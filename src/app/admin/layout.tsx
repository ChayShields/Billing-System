import Link from "next/link"
import { requireAdmin } from "@/lib/auth"
import { logout } from "@/app/login/actions"
import NavLink from "@/components/NavLink"

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

  return (
    <div className="flex min-h-screen bg-surface-sunken">
      <aside className="relative z-10 flex w-64 shrink-0 flex-col bg-surface shadow-lg">
        <div className="flex h-16 items-center gap-2.5 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-accent to-accent-hover text-white shadow-accent">
            <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.7" stroke="currentColor" className="h-4 w-4">
              <rect x="4" y="3" width="12" height="14" rx="1.5" />
              <path d="M7 7h6M7 10h6M7 13h3" strokeLinecap="round" />
            </svg>
          </div>
          <Link href="/admin" className="text-[15px] font-semibold tracking-tight text-ink">
            Billing System
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
                <path d="M7 4H4v12h3M13 14l4-4-4-4M17 10H8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
