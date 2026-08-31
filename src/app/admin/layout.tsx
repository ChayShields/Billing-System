import Link from "next/link"
import { requireAdmin } from "@/lib/auth"
import { logout } from "@/app/login/actions"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold text-slate-900">
              Billing System
            </Link>
            <Link href="/admin/customers" className="text-sm text-slate-600 hover:text-slate-900">
              Customers
            </Link>
            <Link href="/admin/invoices" className="text-sm text-slate-600 hover:text-slate-900">
              Invoices
            </Link>
          </nav>
          <form action={logout}>
            <button type="submit" className="text-sm text-slate-500 hover:text-slate-900">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
