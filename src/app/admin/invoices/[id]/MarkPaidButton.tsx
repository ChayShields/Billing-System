"use client"

import { useTransition } from "react"
import { markInvoicePaid } from "../actions"
import { buttonClasses } from "@/components/ui/Button"

export default function MarkPaidButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Mark this invoice as paid? This will email the customer a confirmation."))
          return
        startTransition(() => markInvoicePaid(invoiceId))
      }}
      className={buttonClasses("success")}
    >
      {isPending ? "Marking as paid..." : "Mark as Paid"}
    </button>
  )
}
