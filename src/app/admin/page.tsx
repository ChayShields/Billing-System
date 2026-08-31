import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: customerCount }, { data: invoices }] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("invoices").select("status, total"),
  ])

  const totals = {
    outstanding: 0,
    paid: 0,
    overdue: 0,
  }
  for (const inv of invoices ?? []) {
    if (inv.status === "paid") totals.paid += inv.total
    else if (inv.status === "overdue") totals.overdue += inv.total
    else totals.outstanding += inv.total
  }

  const formatGBP = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n)

  const cards = [
    { label: "Customers", value: customerCount ?? 0, href: "/admin/customers" },
    { label: "Outstanding", value: formatGBP(totals.outstanding), href: "/admin/invoices" },
    { label: "Overdue", value: formatGBP(totals.overdue), href: "/admin/invoices?status=overdue" },
    { label: "Paid (all time)", value: formatGBP(totals.paid), href: "/admin/invoices?status=paid" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <Link
          href="/admin/invoices/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          New Invoice
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
