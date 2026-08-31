import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { buttonClasses } from "@/components/ui/Button"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: customerCount }, { data: invoices }] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("invoices").select("status, total"),
  ])

  const totals = { outstanding: 0, paid: 0, overdue: 0 }
  for (const inv of invoices ?? []) {
    if (inv.status === "paid") totals.paid += inv.total
    else if (inv.status === "overdue") totals.overdue += inv.total
    else totals.outstanding += inv.total
  }

  const formatGBP = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n)

  const cards = [
    { label: "Customers", value: String(customerCount ?? 0), href: "/admin/customers", tone: "default" },
    { label: "Outstanding", value: formatGBP(totals.outstanding), href: "/admin/invoices", tone: "default" },
    {
      label: "Overdue",
      value: formatGBP(totals.overdue),
      href: "/admin/invoices?status=overdue",
      tone: totals.overdue > 0 ? "overdue" : "default",
    },
    { label: "Paid (all time)", value: formatGBP(totals.paid), href: "/admin/invoices?status=paid", tone: "paid" },
  ]

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

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{card.label}</p>
            <p
              className={`mt-2 text-2xl font-semibold tabular-nums ${
                card.tone === "overdue"
                  ? "text-status-overdue-text"
                  : card.tone === "paid"
                    ? "text-status-paid-text"
                    : "text-ink"
              }`}
            >
              {card.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
