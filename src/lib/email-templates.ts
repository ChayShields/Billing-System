import type { Customer, Invoice, InvoiceItem } from "@/lib/types"
import { BUSINESS, whatsappUrl } from "@/lib/business-details"

const formatGBP = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n)

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

function lineItemRows(items: InvoiceItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0; border-bottom:1px solid #e5e9f0; font-size:14px; color:#0f172a;">${item.description}</td>
          <td style="padding:10px 0; border-bottom:1px solid #e5e9f0; font-size:14px; color:#475569; text-align:right;">${item.quantity}</td>
          <td style="padding:10px 0; border-bottom:1px solid #e5e9f0; font-size:14px; color:#475569; text-align:right;">${formatGBP(item.unit_price)}</td>
          <td style="padding:10px 0; border-bottom:1px solid #e5e9f0; font-size:14px; font-weight:600; color:#0f172a; text-align:right;">${formatGBP(item.amount)}</td>
        </tr>`
    )
    .join("")
}

// Email-safe HTML: table-based layout, inline styles only, no flexbox/grid,
// no CSS variables - Outlook and older clients don't support any of that.
//
// One shared template, two states: "sent" shows the bank payment details
// so the customer knows how to pay; "paid" replaces that box with a paid
// confirmation instead. Same invoice, same layout, different footer box -
// not two unrelated emails.
export function invoiceEmail(
  invoice: Invoice,
  customer: Customer,
  items: InvoiceItem[],
  status: "sent" | "paid"
) {
  const isPaid = status === "paid"

  const statusBox = isPaid
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="background-color:#ecfdf5; color:#047857; font-size:12px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; padding:6px 12px; border-radius:999px;">
            &#10003; Payment Confirmed
          </td>
        </tr>
      </table>`
    : `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="background-color:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; padding:6px 12px; border-radius:999px;">
            Invoice - Payment Due
          </td>
        </tr>
      </table>`

  const introText = isPaid
    ? "Thanks - this confirms I've received your payment and marked the invoice below as paid. No further action is needed on your end."
    : "Please find your invoice below. Payment details are included underneath - let me know if anything looks off."

  const paymentBox = isPaid
    ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ecfdf5; border:1px solid #d1fae5; border-radius:12px; margin-top:20px;">
        <tr>
          <td style="padding:16px 20px; font-size:14px; color:#047857;">
            Paid on ${invoice.paid_date ? formatDate(invoice.paid_date) : ""}
          </td>
        </tr>
      </table>`
    : `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; border:1px solid #e5e9f0; border-radius:12px; margin-top:20px;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 12px; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8;">
              How to pay - bank transfer
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#0f172a;">
              <tr><td style="padding:3px 0; color:#94a3b8; width:40%;">Account name</td><td style="padding:3px 0;">${BUSINESS.bank.accountName}</td></tr>
              <tr><td style="padding:3px 0; color:#94a3b8;">Sort code</td><td style="padding:3px 0;">${BUSINESS.bank.sortCode}</td></tr>
              <tr><td style="padding:3px 0; color:#94a3b8;">Account number</td><td style="padding:3px 0;">${BUSINESS.bank.accountNumber}</td></tr>
              <tr><td style="padding:3px 0; color:#94a3b8;">Bank</td><td style="padding:3px 0;">${BUSINESS.bank.bankName}</td></tr>
              <tr><td style="padding:8px 0 0; color:#94a3b8;">Reference</td><td style="padding:8px 0 0; font-weight:600;">${invoice.invoice_number}</td></tr>
            </table>
          </td>
        </tr>
      </table>`

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${isPaid ? "Payment received" : "Your invoice"} - ${invoice.invoice_number}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#eef1f6; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef1f6; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 1px 2px rgba(15,23,42,0.04);">

            <tr>
              <td style="background-color:#4338ca; padding:28px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:32px; height:32px; background-color:rgba(255,255,255,0.15); border-radius:8px; text-align:center; vertical-align:middle;">
                      <span style="color:#ffffff; font-size:16px; line-height:32px;">&#128179;</span>
                    </td>
                    <td style="padding-left:12px; color:#ffffff; font-size:16px; font-weight:600;">
                      Billing System
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                ${statusBox}

                <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#0f172a;">
                  Hi ${customer.name},
                </p>
                <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#475569;">
                  ${introText}
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                  <tr>
                    <td style="font-size:13px; color:#94a3b8;">Invoice</td>
                    <td style="font-size:13px; color:#94a3b8; text-align:right;">Issued ${formatDate(invoice.issue_date)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:18px; font-weight:600; color:#0f172a; padding-bottom:12px;">${invoice.invoice_number}</td>
                    <td></td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:8px; border-bottom:2px solid #0f172a; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8;">Description</td>
                    <td style="padding-bottom:8px; border-bottom:2px solid #0f172a; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8; text-align:right;">Qty</td>
                    <td style="padding-bottom:8px; border-bottom:2px solid #0f172a; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8; text-align:right;">Price</td>
                    <td style="padding-bottom:8px; border-bottom:2px solid #0f172a; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8; text-align:right;">Amount</td>
                  </tr>
                  ${lineItemRows(items)}
                  <tr>
                    <td colspan="3" style="padding-top:12px; font-size:15px; font-weight:600; color:#0f172a; text-align:right;">Total</td>
                    <td style="padding-top:12px; font-size:15px; font-weight:600; color:#0f172a; text-align:right;">${formatGBP(invoice.total)}</td>
                  </tr>
                </table>

                ${paymentBox}

                <p style="margin:24px 0 0; font-size:15px; line-height:1.6; color:#475569;">
                  If you have any questions, please contact me on
                  <a href="${whatsappUrl()}" style="color:#4338ca; text-decoration:none;">WhatsApp</a>
                  or <a href="mailto:${BUSINESS.contactEmail}" style="color:#4338ca; text-decoration:none;">${BUSINESS.contactEmail}</a>.
                </p>
                <p style="margin:16px 0 0; font-size:15px; line-height:1.6; color:#0f172a;">
                  Chay Shields, Digital Specialist
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px; border-top:1px solid #e5e9f0; background-color:#f8fafc;">
                <p style="margin:0; font-size:12px; line-height:1.5; color:#94a3b8;">
                  Sent by Billing System on behalf of Chay Shields &middot;
                  <a href="https://hireme.link" style="color:#94a3b8;">hireme.link</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
}
