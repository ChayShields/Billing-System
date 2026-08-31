import { Resend } from "resend"
import type { Customer, Invoice } from "@/lib/types"

export async function sendPaidConfirmation(invoice: Invoice, customer: Customer) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(
      `RESEND_API_KEY not set - skipped paid confirmation email for ${invoice.invoice_number}.`
    )
    return
  }

  const resend = new Resend(apiKey)
  const formattedTotal = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(invoice.total)

  await resend.emails.send({
    from: "Chay Shields <billing@hireme.link>",
    to: customer.email,
    subject: `Payment received - ${invoice.invoice_number}`,
    html: `
      <p>Hi ${customer.name},</p>
      <p>Thanks - I've marked invoice <strong>${invoice.invoice_number}</strong> (${formattedTotal}) as paid.</p>
      <p>No further action needed. Let me know if you have any questions.</p>
      <p>Chay</p>
    `,
  })
}
