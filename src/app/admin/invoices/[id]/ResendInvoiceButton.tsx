"use client"

import { useState, useTransition } from "react"
import { resendInvoice } from "../actions"

export default function ResendInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Resend this invoice email to the customer now?")) return
        startTransition(async () => {
          await resendInvoice(invoiceId)
          setSent(true)
          setTimeout(() => setSent(false), 3000)
        })
      }}
      className="text-sm font-medium text-accent hover:text-accent-hover disabled:opacity-50"
    >
      {isPending ? "Sending..." : sent ? "Sent!" : "Resend"}
    </button>
  )
}
