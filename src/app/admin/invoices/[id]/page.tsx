import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Customer, Invoice, InvoiceItem, InvoicePayment } from "@/lib/types"
import StatusBadge from "@/components/ui/StatusBadge"
import { buttonClasses } from "@/components/ui/Button"
import MarkPaidButton from "./MarkPaidButton"
import SendInvoiceButton from "./SendInvoiceButton"
import ResendInvoiceButton from "./ResendInvoiceButton"
import DeletePaymentButton from "./DeletePaymentButton"
import DeleteInvoiceButton from "./DeleteInvoiceButton"
import VoidInvoiceButton from "./VoidInvoiceButton"
import { updateInvoiceStatus, recordPayment } from "../actions"

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

  const { data: payments } = await supabase
    .from("invoice_payments")
    .select("*")
    .eq("invoice_id", id)
    .order("paid_date", { ascending: false })
    .returns<InvoicePayment[]>()

  const totalPaid = (payments ?? []).reduce((sum, p) => sum + p.amount, 0)
  const remaining = Math.max(invoice.total - totalPaid, 0)

  const formatGBP = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n)

  async function markOverdue() {
    "use server"
    await updateInvoiceStatus(invoice!.id, "overdue")
  }

  async function addPaymentAction(formData: FormData) {
    "use server"
    await recordPayment(invoice!.id, formData)
  }

  return (
    <div>
      <Link href="/admin/invoices" className="text-sm text-ink-soft hover:text-ink">
        &larr; Invoices
      </Link>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{invoice.invoice_number}</h1>
          <Link href={`/admin/customers/${invoice.customers.id}`} className="text-sm text-ink-soft hover:text-accent">
            {invoice.customers.name}
            {invoice.customers.company ? ` (${invoice.customers.company})` : ""}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {invoice.status === "draft" && (
            <Link
              href={`/admin/invoices/${invoice.id}/edit`}
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Edit
            </Link>
          )}
          {invoice.status !== "draft" && invoice.status !== "void" && (
            <ResendInvoiceButton invoiceId={invoice.id} />
          )}
          {invoice.status === "paid" && (
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Download PDF
            </a>
          )}
          <StatusBadge status={invoice.status} />
          {invoice.status === "draft" && <DeleteInvoiceButton invoiceId={invoice.id} />}
          {invoice.status !== "draft" && invoice.status !== "void" && (
            <VoidInvoiceButton invoiceId={invoice.id} />
          )}
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

      {invoice.status !== "draft" && invoice.status !== "void" && (
        <div className="mt-4 rounded-3xl border border-border bg-surface shadow-sm p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Payments</h2>
            {invoice.status !== "paid" && (
              <span className="text-sm text-ink-soft">
                {formatGBP(totalPaid)} of {formatGBP(invoice.total)} paid
                {remaining > 0 && (
                  <span className="ml-1 font-medium text-status-overdue-text">
                    ({formatGBP(remaining)} remaining)
                  </span>
                )}
              </span>
            )}
          </div>

          {(payments ?? []).length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              {payments!.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{p.paid_date}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium tabular-nums text-ink">{formatGBP(p.amount)}</span>
                    {invoice.status !== "paid" && (
                      <DeletePaymentButton paymentId={p.id} invoiceId={invoice.id} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {invoice.status !== "paid" && (
            <form action={addPaymentAction} className="mt-4 flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs text-ink-faint">Amount</label>
                <input
                  name="amount"
                  type="number"
                  min={0.01}
                  step="0.01"
                  required
                  placeholder={formatGBP(remaining)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-ink-faint">Date</label>
                <input
                  name="paid_date"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button type="submit" className={buttonClasses("secondary")}>
                Log payment
              </button>
            </form>
          )}
        </div>
      )}

      {invoice.status !== "paid" && invoice.status !== "void" && (
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
