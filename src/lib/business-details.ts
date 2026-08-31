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
