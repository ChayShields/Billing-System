import type { Customer, Invoice } from "@/lib/types"

// Email-safe HTML: table-based layout, inline styles only, no flexbox/grid,
// no CSS variables - Outlook and older clients don't support any of that.
export function paidConfirmationEmail(invoice: Invoice, customer: Customer) {
  const formattedTotal = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(invoice.total)

  const formattedDate = invoice.paid_date
    ? new Date(invoice.paid_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : ""

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Payment received</title>
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
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                  <tr>
                    <td style="background-color:#ecfdf5; color:#047857; font-size:12px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; padding:6px 12px; border-radius:999px;">
                      &#10003; Payment Confirmed
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#0f172a;">
                  Hi ${customer.name},
                </p>
                <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#475569;">
                  Thanks - this confirms I've received your payment and marked the invoice below as
                  paid. No further action is needed on your end.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; border:1px solid #e5e9f0; border-radius:12px; margin-bottom:24px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom:12px; font-size:13px; color:#94a3b8;">Invoice</td>
                          <td style="padding-bottom:12px; font-size:13px; color:#94a3b8; text-align:right;">Amount Paid</td>
                        </tr>
                        <tr>
                          <td style="font-size:18px; font-weight:600; color:#0f172a;">${invoice.invoice_number}</td>
                          <td style="font-size:18px; font-weight:600; color:#047857; text-align:right;">${formattedTotal}</td>
                        </tr>
                        ${
                          formattedDate
                            ? `<tr><td colspan="2" style="padding-top:12px; font-size:13px; color:#94a3b8;">Paid on ${formattedDate}</td></tr>`
                            : ""
                        }
                      </table>
                    </td>
                  </tr>
                </table>

                <p style="margin:0; font-size:15px; line-height:1.6; color:#475569;">
                  Let me know if you have any questions.
                </p>
                <p style="margin:16px 0 0; font-size:15px; line-height:1.6; color:#0f172a;">
                  Chay
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
