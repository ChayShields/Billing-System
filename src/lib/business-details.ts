// Single production domain for this app. Passed explicitly as `redirectTo`
// on every password-reset call rather than relying on Supabase's dashboard
// "Site URL" fallback, which proved unreliable in practice.
export const SITE_URL = "https://billing.hireme.link"

// Chay's own contact/payment details, used across invoice emails. Not a
// secret - this is exactly the information a customer needs to pay by
// bank transfer, the same as what would appear on a printed invoice.
export const BUSINESS = {
  contactEmail: "Chay@Hireme.link",
  whatsappNumber: "447492585595",
  bank: {
    accountName: "Chay Levi Shields",
    sortCode: "11-04-95",
    accountNumber: "12177361",
    bankName: "Halifax/Lloyds",
  },
}

export function whatsappUrl() {
  return `https://wa.me/${BUSINESS.whatsappNumber}`
}
