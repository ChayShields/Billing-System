"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { updateCustomerGA4Property } from "../actions"
import { buttonClasses } from "@/components/ui/Button"
import type { GA4PropertyOption } from "@/lib/google-analytics"

export default function GA4PropertyForm({
  customerId,
  initialValue,
  options,
}: {
  customerId: string
  initialValue: string | null
  options: GA4PropertyOption[]
}) {
  const [value, setValue] = useState(initialValue ?? "")
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (options.length === 0) {
    return (
      <p className="mt-3 text-sm text-ink-faint">
        No Google Analytics properties found -{" "}
        <Link href="/admin/analytics" className="text-accent hover:underline">
          connect your Google account
        </Link>{" "}
        first.
      </p>
    )
  }

  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          await updateCustomerGA4Property(customerId, value || null)
          setSaved(true)
        })
      }}
    >
      <select
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setSaved(false)
        }}
        className="flex-1 rounded-xl border border-border bg-surface-sunken px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      >
        <option value="">No property assigned</option>
        {initialValue && !options.some((opt) => opt.propertyId === initialValue) && (
          <option value={initialValue}>Property {initialValue} (no longer visible to this account)</option>
        )}
        {options.map((opt) => (
          <option key={opt.propertyId} value={opt.propertyId}>
            {opt.label}
          </option>
        ))}
      </select>
      <button type="submit" disabled={isPending} className={buttonClasses("secondary")}>
        {saved && !isPending ? "Saved" : "Save"}
      </button>
    </form>
  )
}
