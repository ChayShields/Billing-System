import { Resend } from "resend"
import type { Customer, Invoice, InvoiceItem } from "@/lib/types"
import { invoiceEmail } from "@/lib/email-templates"

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

export async function sendInvoiceIssued(invoice: Invoice, customer: Customer, items: InvoiceItem[]) {
  const resend = getResend()
  if (!resend) {
    console.warn(`RESEND_API_KEY not set - skipped invoice email for ${invoice.invoice_number}.`)
    return
  }

  await resend.emails.send({
    from: "Chay Shields <billing@hireme.link>",
    to: customer.email,
    subject: `Invoice ${invoice.invoice_number} from Chay Shields`,
    html: invoiceEmail(invoice, customer, items, "sent"),
  })
}

export async function sendPaidConfirmation(invoice: Invoice, customer: Customer, items: InvoiceItem[]) {
  const resend = getResend()
  if (!resend) {
    console.warn(
      `RESEND_API_KEY not set - skipped paid confirmation email for ${invoice.invoice_number}.`
    )
    return
  }

  await resend.emails.send({
    from: "Chay Shields <billing@hireme.link>",
    to: customer.email,
    subject: `Payment received - ${invoice.invoice_number}`,
    html: invoiceEmail(invoice, customer, items, "paid"),
  })
}
