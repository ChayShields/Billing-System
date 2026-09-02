import Link from "next/link"
import { notFound } from "next/navigation"
import { requireCustomer } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import StatusBadge from "@/components/ui/StatusBadge"
import type { Invoice, InvoiceItem } from "@/lib/types"

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
      <Link href="/portal" className="text-sm text-ink-soft hover:text-ink">
        &larr; Your Invoices
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{invoice.invoice_number}</h1>
        <div className="flex items-center gap-3">
          {invoice.status === "paid" && (
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Download PDF
            </a>
          )}
          <StatusBadge status={invoice.status} />
        </div>
      </div>

      {/* Line items: stacked cards on phones, a real table from sm up */}
      <div className="mt-6 flex flex-col gap-2 sm:hidden">
        {invoice.invoice_items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-sm font-medium text-ink">{item.description}</p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-ink-soft">
                {item.quantity} &times; {formatGBP(item.unit_price)}
              </span>
              <span className="font-semibold text-ink">{formatGBP(item.amount)}</span>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-2xl bg-surface-muted px-4 py-3">
          <span className="font-semibold text-ink">Total</span>
          <span className="text-lg font-semibold text-ink">{formatGBP(invoice.total)}</span>
        </div>
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-3xl border border-border bg-surface shadow-sm sm:block">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3 text-right">Qty</th>
              <th className="px-5 py-3 text-right">Unit Price</th>
              <th className="px-5 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.invoice_items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5 text-ink">{item.description}</td>
                <td className="px-5 py-3.5 text-right text-ink-soft">{item.quantity}</td>
                <td className="px-5 py-3.5 text-right text-ink-soft">{formatGBP(item.unit_price)}</td>
                <td className="px-5 py-3.5 text-right font-medium text-ink">{formatGBP(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-surface-muted">
              <td colSpan={3} className="px-5 py-3.5 text-right font-semibold text-ink">
                Total
              </td>
              <td className="px-5 py-3.5 text-right text-lg font-semibold text-ink">
                {formatGBP(invoice.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {invoice.notes && (
        <div className="mt-4 rounded-3xl border border-border bg-surface shadow-sm p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Notes</p>
          <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">{invoice.notes}</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <p className="text-ink-soft">
          Issued: <span className="text-ink">{invoice.issue_date}</span>
        </p>
        <p className="text-ink-soft">
          Due: <span className="text-ink">{invoice.due_date ?? "–"}</span>
        </p>
        {invoice.paid_date && (
          <p className="text-ink-soft">
            Paid: <span className="text-ink">{invoice.paid_date}</span>
          </p>
        )}
      </div>
    </div>
  )
}
