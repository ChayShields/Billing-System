import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { buttonClasses } from "@/components/ui/Button"
import InvoiceList from "./InvoiceList"
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Invoices</h1>
          <p className="mt-1 text-sm text-ink-soft">Every invoice you've raised.</p>
        </div>
        <Link href="/admin/invoices/new" className={buttonClasses("primary", "w-full sm:w-auto justify-center")}>
          New Invoice
        </Link>
      </div>

      <div className="-mx-4 mt-5 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/invoices?status=${f.value}` : "/admin/invoices"}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              (status ?? undefined) === f.value
                ? "bg-ink text-white"
                : "bg-surface text-ink-soft hover:bg-surface-sunken"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <InvoiceList invoices={invoices ?? []} />
    </div>
  )
}
