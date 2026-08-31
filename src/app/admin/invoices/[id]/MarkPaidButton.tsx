"use client"

import { useTransition } from "react"
import { markInvoicePaid } from "../actions"

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
      className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
    >
      {isPending ? "Marking as paid..." : "Mark as Paid"}
    </button>
  )
}
