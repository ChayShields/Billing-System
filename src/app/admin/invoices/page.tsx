import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { Customer, Invoice, InvoiceStatus } from "@/lib/types"

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
}

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
        <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
        <Link
          href="/admin/invoices/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          New Invoice
        </Link>
      </div>

      <div className="mt-4 flex gap-2 text-sm">
        {["all", "draft", "sent", "paid", "overdue"].map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/invoices" : `/admin/invoices?status=${s}`}
            className={`rounded-full px-3 py-1 ${
              (status ?? "all") === s
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {s[0].toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Number</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Due</th>
            </tr>
          </thead>
          <tbody>
            {(invoices ?? []).map((inv) => (
              <tr key={inv.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/invoices/${inv.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {inv.invoice_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{inv.customers?.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[inv.status]}`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
                    inv.total
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{inv.due_date ?? "-"}</td>
              </tr>
            ))}
            {(invoices ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
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
