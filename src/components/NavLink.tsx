"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

export default function NavLink({
  href,
  icon,
  children,
}: {
  href: string
  icon: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-surface-sunken hover:text-ink"
      }`}
    >
      <span className="h-4 w-4 shrink-0">{icon}</span>
      {children}
    </Link>
  )
}
