import { Resend } from "resend"
import type { Customer, Invoice } from "@/lib/types"
import { paidConfirmationEmail } from "@/lib/email-templates"

export async function sendPaidConfirmation(invoice: Invoice, customer: Customer) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(
      `RESEND_API_KEY not set - skipped paid confirmation email for ${invoice.invoice_number}.`
    )
    return
  }

  const resend = new Resend(apiKey)

  await resend.emails.send({
    from: "Chay Shields <billing@hireme.link>",
    to: customer.email,
    subject: `Payment received - ${invoice.invoice_number}`,
    html: paidConfirmationEmail(invoice, customer),
  })
}
