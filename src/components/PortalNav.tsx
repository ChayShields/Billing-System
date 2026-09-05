"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  { href: "/portal", label: "Invoices" },
  { href: "/portal/analytics", label: "Analytics" },
]

export default function PortalNav({ showAnalytics }: { showAnalytics: boolean }) {
  const pathname = usePathname()
  if (!showAnalytics) return null

  return (
    <nav className="mx-auto flex max-w-2xl gap-1 px-4 pb-3">
      {TABS.map((tab) => {
        const active = tab.href === "/portal" ? pathname === "/portal" : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
              active ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-surface-sunken hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
