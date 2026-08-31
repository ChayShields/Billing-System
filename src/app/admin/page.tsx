import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { buttonClasses } from "@/components/ui/Button"
import StatusBadge from "@/components/ui/StatusBadge"
import type { Customer, Invoice } from "@/lib/types"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: customerCount }, { data: invoices }] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase
      .from("invoices")
      .select("*, customers(name, company)")
      .order("issue_date", { ascending: false })
      .returns<(Invoice & { customers: Customer })[]>(),
  ])

  const totals = { outstanding: 0, paid: 0, overdue: 0 }
  for (const inv of invoices ?? []) {
    if (inv.status === "paid") totals.paid += inv.total
    else if (inv.status === "overdue") totals.overdue += inv.total
    else totals.outstanding += inv.total
  }

  const formatGBP = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n)

  const recent = (invoices ?? []).slice(0, 5)

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-soft">An overview of your customers and invoices.</p>
        </div>
        <Link href="/admin/invoices/new" className={buttonClasses("primary")}>
          New Invoice
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rise-in relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-[#2f2596] p-6 text-white shadow-lg lg:col-span-2">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
          />
          <p className="relative text-xs font-medium uppercase tracking-wide text-white/70">
            Outstanding balance
          </p>
          <p className="relative mt-2 text-4xl font-semibold tabular-nums">{formatGBP(totals.outstanding)}</p>
          <p className="relative mt-3 text-sm text-white/70">
            Across sent and draft invoices awaiting payment.
          </p>
          <Link
            href="/admin/invoices"
            className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-white/80"
          >
            View all invoices
            <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-3.5 w-3.5">
              <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="rise-in flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface shadow-sm" style={{ animationDelay: "80ms" }}>
          <Link
            href="/admin/customers"
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-muted"
          >
            <span className="text-sm text-ink-soft">Customers</span>
            <span className="text-lg font-semibold tabular-nums text-ink">{customerCount ?? 0}</span>
          </Link>
          <Link
            href="/admin/invoices?status=overdue"
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-muted"
          >
            <span className="text-sm text-ink-soft">Overdue</span>
            <span
              className={`text-lg font-semibold tabular-nums ${totals.overdue > 0 ? "text-status-overdue-text" : "text-ink"}`}
            >
              {formatGBP(totals.overdue)}
            </span>
          </Link>
          <Link
            href="/admin/invoices?status=paid"
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-muted"
          >
            <span className="text-sm text-ink-soft">Paid (all time)</span>
            <span className="text-lg font-semibold tabular-nums text-status-paid-text">
              {formatGBP(totals.paid)}
            </span>
          </Link>
        </div>
      </div>

      <div className="rise-in mt-6" style={{ animationDelay: "140ms" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Recent invoices</h2>
          <Link href="/admin/invoices" className="text-sm font-medium text-accent hover:text-accent-hover">
            View all
          </Link>
        </div>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-faint">
              No invoices yet - create your first one.
            </p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {recent.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/invoices/${inv.id}`} className="font-medium text-ink hover:text-accent">
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">{inv.customers?.name}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-ink">
                      {formatGBP(inv.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
