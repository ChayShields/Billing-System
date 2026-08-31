"use client"

import { useTransition } from "react"
import { markInvoiceSent } from "../actions"
import { buttonClasses } from "@/components/ui/Button"

export default function SendInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (
          !confirm(
            "Send this invoice to the customer now? This emails them the amount and bank payment details."
          )
        )
          return
        startTransition(() => markInvoiceSent(invoiceId))
      }}
      className={buttonClasses("secondary")}
    >
      {isPending ? "Sending..." : "Send Invoice"}
    </button>
  )
}
