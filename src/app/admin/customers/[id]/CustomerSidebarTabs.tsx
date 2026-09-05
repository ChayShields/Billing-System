"use client"

import { useState, type ReactNode } from "react"

const TABS = ["Details", "Billing", "Dashboard Access"] as const
type Tab = (typeof TABS)[number]

export default function CustomerSidebarTabs({
  details,
  billing,
  dashboardAccess,
}: {
  details: ReactNode
  billing: ReactNode
  dashboardAccess: ReactNode
}) {
  const [active, setActive] = useState<Tab>("Details")
  const panels: Record<Tab, ReactNode> = { Details: details, Billing: billing, "Dashboard Access": dashboardAccess }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-2xl border border-border bg-surface p-1 shadow-xs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`flex-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors sm:text-sm ${
              active === tab ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-surface-sunken hover:text-ink"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-4">{panels[active]}</div>
    </div>
  )
}
