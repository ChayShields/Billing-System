"use client"

import { useState } from "react"
import Link from "next/link"
import StatusBadge from "@/components/ui/StatusBadge"
import type { Customer, Invoice } from "@/lib/types"

export default function InvoiceList({
  invoices,
}: {
  invoices: (Invoice & { customers: Customer })[]
}) {
  const [query, setQuery] = useState("")

  const filtered = invoices.filter((inv) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      inv.invoice_number.toLowerCase().includes(q) ||
      (inv.customers?.name ?? "").toLowerCase().includes(q) ||
      (inv.customers?.company ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="relative mt-4">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          strokeWidth="1.6"
          stroke="currentColor"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
        >
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path d="m17 17-4-4" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search invoices by number or customer..."
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.map((inv) => (
          <Link
            key={inv.id}
            href={`/admin/invoices/${inv.id}`}
            className="group flex items-center justify-between rounded-3xl border border-border bg-surface p-5 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-sunken text-ink-soft">
                <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
                  <rect x="4" y="3" width="12" height="14" rx="1.5" />
                  <path d="M7 7h6M7 10h6M7 13h3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-ink group-hover:text-accent">{inv.invoice_number}</p>
                <p className="text-xs text-ink-faint">{inv.customers?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-xs text-ink-faint sm:block">Due {inv.due_date ?? "–"}</span>
              <span className="text-sm font-medium tabular-nums text-ink">
                {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(inv.total)}
              </span>
              <StatusBadge status={inv.status} />
            </div>
          </Link>
        ))}
        {filtered.length === 0 && invoices.length > 0 && (
          <p className="rounded-3xl border border-dashed border-border p-10 text-center text-ink-faint">
            No invoices match &ldquo;{query}&rdquo;.
          </p>
        )}
        {invoices.length === 0 && (
          <p className="rounded-3xl border border-dashed border-border p-10 text-center text-ink-faint">
            No invoices found.
          </p>
        )}
      </div>
    </div>
  )
}
