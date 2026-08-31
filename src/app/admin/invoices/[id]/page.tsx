import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Customer, Invoice, InvoiceItem } from "@/lib/types"
import StatusBadge from "@/components/ui/StatusBadge"
import { buttonClasses } from "@/components/ui/Button"
import MarkPaidButton from "./MarkPaidButton"
import SendInvoiceButton from "./SendInvoiceButton"
import { updateInvoiceStatus } from "../actions"

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customers(*), invoice_items(*)")
    .eq("id", id)
    .single<Invoice & { customers: Customer; invoice_items: InvoiceItem[] }>()

  if (!invoice) notFound()

  const formatGBP = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n)

  async function markOverdue() {
    "use server"
    await updateInvoiceStatus(invoice!.id, "overdue")
  }

  return (
    <div>
      <Link href="/admin/invoices" className="text-sm text-ink-soft hover:text-ink">
        &larr; Invoices
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{invoice.invoice_number}</h1>
          <Link href={`/admin/customers/${invoice.customers.id}`} className="text-sm text-ink-soft hover:text-accent">
            {invoice.customers.name}
            {invoice.customers.company ? ` (${invoice.customers.company})` : ""}
          </Link>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
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

      {invoice.status !== "paid" && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <MarkPaidButton invoiceId={invoice.id} />
          {invoice.status === "draft" && <SendInvoiceButton invoiceId={invoice.id} />}
          {invoice.status !== "overdue" && (
            <form action={markOverdue}>
              <button type="submit" className={buttonClasses("secondary")}>
                Mark as Overdue
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
