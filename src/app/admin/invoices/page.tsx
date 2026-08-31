import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { buttonClasses } from "@/components/ui/Button"
import StatusBadge from "@/components/ui/StatusBadge"
import type { Customer, Invoice, InvoiceStatus } from "@/lib/types"

const FILTERS: { label: string; value?: InvoiceStatus }[] = [
  { label: "All" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
]

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: InvoiceStatus }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("invoices")
    .select("*, customers(name, company)")
    .order("issue_date", { ascending: false })

  if (status) query = query.eq("status", status)

  const { data: invoices } = await query.returns<(Invoice & { customers: Customer })[]>()

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Invoices</h1>
          <p className="mt-1 text-sm text-ink-soft">Every invoice you've raised.</p>
        </div>
        <Link href="/admin/invoices/new" className={buttonClasses("primary")}>
          New Invoice
        </Link>
      </div>

      <div className="mt-5 flex gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/invoices?status=${f.value}` : "/admin/invoices"}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              (status ?? undefined) === f.value
                ? "bg-ink text-white"
                : "bg-surface text-ink-soft hover:bg-surface-sunken"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-5 py-3">Number</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Due</th>
            </tr>
          </thead>
          <tbody>
            {(invoices ?? []).map((inv) => (
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
                <td className="px-5 py-3.5 text-ink-soft">
                  {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(inv.total)}
                </td>
                <td className="px-5 py-3.5 text-ink-soft">{inv.due_date ?? "–"}</td>
              </tr>
            ))}
            {(invoices ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-ink-faint">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
