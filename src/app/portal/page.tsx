import Link from "next/link"
import { requireCustomer } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import StatusBadge from "@/components/ui/StatusBadge"
import type { Invoice } from "@/lib/types"

export default async function PortalPage() {
  const profile = await requireCustomer()
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("customer_id", profile.customer_id!)
    .order("issue_date", { ascending: false })
    .returns<Invoice[]>()

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Your Invoices</h1>
      <p className="mt-1 text-sm text-ink-soft">Everything you've been billed, and what's outstanding.</p>

      <div className="mt-5 flex flex-col gap-3">
        {(invoices ?? []).map((inv) => (
          <Link
            key={inv.id}
            href={`/portal/invoices/${inv.id}`}
            className="group flex items-center justify-between rounded-2xl border border-border bg-surface shadow-sm p-4 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
          >
            <div>
              <p className="font-medium text-ink">{inv.invoice_number}</p>
              <p className="text-xs text-ink-faint">Due {inv.due_date ?? "–"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium tabular-nums text-ink">
                {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(inv.total)}
              </span>
              <StatusBadge status={inv.status} />
            </div>
          </Link>
        ))}
        {(invoices ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-faint">
            No invoices yet.
          </p>
        )}
      </div>
    </div>
  )
}
