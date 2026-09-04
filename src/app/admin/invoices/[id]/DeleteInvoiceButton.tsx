"use client"

import { useTransition } from "react"
import { deleteInvoice } from "../actions"
import { buttonClasses } from "@/components/ui/Button"

export default function DeleteInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Permanently delete this draft invoice? This can't be undone.")) return
        startTransition(() => deleteInvoice(invoiceId))
      }}
      className={buttonClasses("danger")}
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  )
}
