"use client"

import { useTransition } from "react"
import { voidInvoice } from "../actions"
import { buttonClasses } from "@/components/ui/Button"

export default function VoidInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (
          !confirm(
            "Void this invoice? It stays in your records but drops off revenue totals and the customer's portal view. This can't be undone."
          )
        )
          return
        startTransition(() => voidInvoice(invoiceId))
      }}
      className={buttonClasses("danger")}
    >
      {isPending ? "Voiding..." : "Void Invoice"}
    </button>
  )
}
