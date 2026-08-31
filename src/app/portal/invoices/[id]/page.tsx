import Link from "next/link"
import { notFound } from "next/navigation"
import { requireCustomer } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { Invoice, InvoiceItem } from "@/lib/types"

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
}

export default async function PortalInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await requireCustomer()
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", id)
    .eq("customer_id", profile.customer_id!)
    .single<Invoice & { invoice_items: InvoiceItem[] }>()

  if (!invoice) notFound()

  const formatGBP = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n)

  return (
    <div>
      <Link href="/portal" className="text-sm text-slate-500 hover:text-slate-900">
        &larr; Your Invoices
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{invoice.invoice_number}</h1>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[invoice.status]}`}
        >
          {invoice.status}
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Unit Price</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.invoice_items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-700">{item.description}</td>
                <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {formatGBP(item.unit_price)}
                </td>
                <td className="px-4 py-3 text-right text-slate-900">{formatGBP(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-semibold text-slate-900">
                Total
              </td>
              <td className="px-4 py-3 text-right text-lg font-semibold text-slate-900">
                {formatGBP(invoice.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {invoice.notes && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Notes</p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{invoice.notes}</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-500 sm:grid-cols-3">
        <p>
          Issued: <span className="text-slate-700">{invoice.issue_date}</span>
        </p>
        <p>
          Due: <span className="text-slate-700">{invoice.due_date ?? "-"}</span>
        </p>
        {invoice.paid_date && (
          <p>
            Paid: <span className="text-slate-700">{invoice.paid_date}</span>
          </p>
        )}
      </div>
    </div>
  )
}
