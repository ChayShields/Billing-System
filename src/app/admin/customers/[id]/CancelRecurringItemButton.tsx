"use client"

import { useTransition } from "react"
import { cancelRecurringItem } from "../actions"

export default function CancelRecurringItemButton({
  recurringItemId,
  customerId,
}: {
  recurringItemId: string
  customerId: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Cancel this recurring billing item? It won't generate any future invoices.")) return
        startTransition(() => cancelRecurringItem(recurringItemId, customerId))
      }}
      className="text-xs font-medium text-ink-faint hover:text-status-overdue-text disabled:opacity-50"
    >
      {isPending ? "Cancelling..." : "Cancel"}
    </button>
  )
}
