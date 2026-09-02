"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import NavLink from "@/components/NavLink"

type NavItem = {
  href: string
  label: string
  icon: ReactNode
}

export default function AdminSidebar({
  nav,
  logoutForm,
}: {
  nav: NavItem[]
  logoutForm: ReactNode
}) {
  const [open, setOpen] = useState(false)

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-2.5 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-accent to-accent-hover text-white shadow-accent">
          <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.7" stroke="currentColor" className="h-4 w-4">
            <rect x="4" y="3" width="12" height="14" rx="1.5" />
            <path d="M7 7h6M7 10h6M7 13h3" strokeLinecap="round" />
          </svg>
        </div>
        <Link href="/admin" className="text-[15px] font-semibold tracking-tight text-ink" onClick={() => setOpen(false)}>
          Billing System
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {nav.map((item) => (
          <div key={item.href} onClick={() => setOpen(false)}>
            <NavLink href={item.href} icon={item.icon}>
              {item.label}
            </NavLink>
          </div>
        ))}
      </nav>
      <div className="p-3">
        {logoutForm}
        <p className="mt-1 flex justify-center gap-2 px-3 text-[11px] text-ink-faint">
          <Link href="/privacy-policy" className="hover:text-ink-soft">
            Privacy
          </Link>
          <span>·</span>
          <Link href="/terms-of-service" className="hover:text-ink-soft">
            Terms
          </Link>
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar - fixed, not sticky: WebKit/iOS has a well-documented bug
          where touch hit-testing on `position: sticky` elements inside a flex
          container can desync from where the element is actually rendered. */}
      <div className="fixed left-0 right-0 top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface px-4 shadow-sm md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-surface-sunken hover:text-ink"
        >
          <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.7" stroke="currentColor" className="pointer-events-none h-5 w-5">
            <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
          </svg>
        </button>
        <Link href="/admin" className="text-[15px] font-semibold tracking-tight text-ink">
          Billing System
        </Link>
        <div className="h-10 w-10" aria-hidden="true" />
      </div>
      {/* Spacer to reserve the fixed top bar's height in normal flow */}
      <div className="h-14 md:hidden" />

      {/* Mobile off-canvas drawer */}
      {open && (
        <div className="fixed left-0 right-0 top-0 bottom-0 z-30 md:hidden">
          <div
            className="absolute left-0 right-0 top-0 bottom-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 bottom-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-lg">
            <div className="flex justify-end p-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft hover:bg-surface-sunken hover:text-ink"
              >
                <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.7" stroke="currentColor" className="pointer-events-none h-4 w-4">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 flex-col">{sidebarContent}</div>
          </aside>
        </div>
      )}

      {/* Desktop fixed sidebar */}
      <aside className="relative z-10 hidden w-64 shrink-0 flex-col bg-surface shadow-lg md:flex">
        {sidebarContent}
      </aside>
    </>
  )
}
