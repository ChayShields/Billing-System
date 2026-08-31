import Link from "next/link"
import { requireCustomer } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { Invoice } from "@/lib/types"

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
}

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
      <h1 className="text-2xl font-semibold text-slate-900">Your Invoices</h1>

      <div className="mt-4 flex flex-col gap-3">
        {(invoices ?? []).map((inv) => (
          <Link
            key={inv.id}
            href={`/portal/invoices/${inv.id}`}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
          >
            <div>
              <p className="font-medium text-slate-900">{inv.invoice_number}</p>
              <p className="text-xs text-slate-500">Due {inv.due_date ?? "-"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700">
                {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
                  inv.total
                )}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[inv.status]}`}
              >
                {inv.status}
              </span>
            </div>
          </Link>
        ))}
        {(invoices ?? []).length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            No invoices yet.
          </p>
        )}
      </div>
    </div>
  )
}
