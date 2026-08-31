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

      <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <div className="rise-in relative col-span-2 row-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-[#2f2596] p-7 text-white shadow-lg">
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
          <p className="relative mt-3 text-5xl font-semibold tabular-nums">{formatGBP(totals.outstanding)}</p>
          <p className="relative mt-3 max-w-xs text-sm text-white/70">
            Across sent and draft invoices awaiting payment.
          </p>
          <Link
            href="/admin/invoices"
            className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-white/80"
          >
            View all invoices
            <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-3.5 w-3.5">
              <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <Link
          href="/admin/customers"
          className="rise-in col-span-2 flex items-center justify-between rounded-3xl border border-border bg-surface p-5 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md sm:col-span-1"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-sunken text-ink-soft">
            <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
              <circle cx="10" cy="7" r="3" />
              <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums text-ink">{customerCount ?? 0}</p>
            <p className="text-xs text-ink-faint">Customers</p>
          </div>
        </Link>

        <Link
          href="/admin/invoices?status=overdue"
          className="rise-in col-span-2 flex items-center justify-between rounded-3xl border border-border bg-surface p-5 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md sm:col-span-1"
          style={{ animationDelay: "120ms" }}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${totals.overdue > 0 ? "bg-status-overdue-bg text-status-overdue-text" : "bg-surface-sunken text-ink-soft"}`}
          >
            <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
              <path d="M10 6v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="10" r="7" />
            </svg>
          </div>
          <div className="text-right">
            <p
              className={`text-2xl font-semibold tabular-nums ${totals.overdue > 0 ? "text-status-overdue-text" : "text-ink"}`}
            >
              {formatGBP(totals.overdue)}
            </p>
            <p className="text-xs text-ink-faint">Overdue</p>
          </div>
        </Link>

        <Link
          href="/admin/invoices?status=paid"
          className="rise-in col-span-2 flex items-center justify-between rounded-3xl border border-border bg-surface p-5 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md lg:col-span-2"
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-status-paid-bg text-status-paid-text">
            <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
              <path d="M4 10.5 8 14l8-8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums text-status-paid-text">{formatGBP(totals.paid)}</p>
            <p className="text-xs text-ink-faint">Paid (all time)</p>
          </div>
        </Link>
      </div>

      <div className="rise-in mt-6" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Recent invoices</h2>
          <Link href="/admin/invoices" className="text-sm font-medium text-accent hover:text-accent-hover">
            View all
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {recent.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-ink-faint">
              No invoices yet - create your first one.
            </p>
          ) : (
            recent.map((inv) => (
              <Link
                key={inv.id}
                href={`/admin/invoices/${inv.id}`}
                className="group flex items-center justify-between rounded-3xl border border-border bg-surface p-4 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
              >
                <div>
                  <p className="font-medium text-ink group-hover:text-accent">{inv.invoice_number}</p>
                  <p className="text-xs text-ink-faint">{inv.customers?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium tabular-nums text-ink">{formatGBP(inv.total)}</span>
                  <StatusBadge status={inv.status} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
