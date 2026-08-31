import { requireCustomer } from "@/lib/auth"
import { logout } from "@/app/login/actions"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await requireCustomer()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <span className="font-semibold text-slate-900">My Invoices</span>
          <form action={logout}>
            <button type="submit" className="text-sm text-slate-500 hover:text-slate-900">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  )
}
