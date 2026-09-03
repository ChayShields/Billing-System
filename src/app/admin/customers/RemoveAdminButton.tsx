"use client"

import { useTransition } from "react"
import { removeAdmin } from "./actions"

export default function RemoveAdminButton({ userId, email }: { userId: string; email: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`Remove ${email}'s admin access? This can't be undone.`)) return
        startTransition(() => removeAdmin(userId))
      }}
      className="text-xs font-medium text-ink-faint hover:text-status-overdue-text disabled:opacity-50"
    >
      {isPending ? "Removing..." : "Remove"}
    </button>
  )
}
