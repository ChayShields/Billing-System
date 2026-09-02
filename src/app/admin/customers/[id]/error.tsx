"use client"

import Link from "next/link"
import { buttonClasses } from "@/components/ui/Button"

export default function CustomerDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isDuplicateEmail = /already been registered|already registered|already exists/i.test(error.message)

  return (
    <div className="flex flex-col items-start gap-3 rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <p className="text-sm font-semibold text-ink">Something went wrong</p>
      <p className="text-sm text-ink-soft">
        {isDuplicateEmail
          ? "That email already has an account elsewhere in the system - can't create a second login for it. Use a different email for this customer, or check whether they already have a login under this one."
          : "That action didn't go through. Try again, or come back to this later."}
      </p>
      <div className="flex items-center gap-3">
        <button type="button" onClick={reset} className={buttonClasses("secondary")}>
          Try again
        </button>
        <Link href="/admin/customers" className="text-sm text-ink-soft hover:text-ink">
          Back to customers
        </Link>
      </div>
    </div>
  )
}
