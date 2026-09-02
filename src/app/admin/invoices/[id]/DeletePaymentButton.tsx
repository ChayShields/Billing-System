"use client"

import { useTransition } from "react"
import { deletePayment } from "../actions"

export default function DeletePaymentButton({
  paymentId,
  invoiceId,
}: {
  paymentId: string
  invoiceId: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Remove this payment entry? This can't be undone.")) return
        startTransition(() => deletePayment(paymentId, invoiceId))
      }}
      className="text-xs text-ink-faint hover:text-status-overdue-text disabled:opacity-50"
      aria-label="Remove payment"
    >
      <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-3.5 w-3.5">
        <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
      </svg>
    </button>
  )
}
