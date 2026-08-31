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

      <div className="mt-4 flex flex-col gap-3">
        {(invoices ?? []).map((inv) => (
          <Link
            key={inv.id}
            href={`/admin/invoices/${inv.id}`}
            className="group flex items-center justify-between rounded-3xl border border-border bg-surface p-5 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-sunken text-ink-soft">
                <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
                  <rect x="4" y="3" width="12" height="14" rx="1.5" />
                  <path d="M7 7h6M7 10h6M7 13h3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-ink group-hover:text-accent">{inv.invoice_number}</p>
                <p className="text-xs text-ink-faint">{inv.customers?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-xs text-ink-faint sm:block">Due {inv.due_date ?? "–"}</span>
              <span className="text-sm font-medium tabular-nums text-ink">
                {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(inv.total)}
              </span>
              <StatusBadge status={inv.status} />
            </div>
          </Link>
        ))}
        {(invoices ?? []).length === 0 && (
          <p className="rounded-3xl border border-dashed border-border p-10 text-center text-ink-faint">
            No invoices found.
          </p>
        )}
      </div>
    </div>
  )
}
