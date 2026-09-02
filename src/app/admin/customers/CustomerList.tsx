"use client"

import { useState } from "react"
import Link from "next/link"
import type { Customer } from "@/lib/types"

export default function CustomerList({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("")

  const filtered = customers.filter((c) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="relative">
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
          placeholder="Search customers by name, email, or company..."
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/admin/customers/${c.id}`}
            className="group flex items-center justify-between rounded-3xl border border-border bg-surface p-5 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-sm font-semibold text-accent">
                {c.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-ink group-hover:text-accent">{c.name}</p>
                <p className="text-xs text-ink-faint">{c.company ?? c.email}</p>
              </div>
            </div>
            <span className="hidden text-sm text-ink-soft sm:block">{c.email}</span>
          </Link>
        ))}
        {filtered.length === 0 && customers.length > 0 && (
          <p className="rounded-3xl border border-dashed border-border p-10 text-center text-ink-faint">
            No customers match &ldquo;{query}&rdquo;.
          </p>
        )}
        {customers.length === 0 && (
          <p className="rounded-3xl border border-dashed border-border p-10 text-center text-ink-faint">
            No customers yet - add your first one.
          </p>
        )}
      </div>
    </div>
  )
}
