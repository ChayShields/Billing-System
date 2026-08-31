"use client"

import { useState } from "react"
import Link from "next/link"
import { requestPasswordReset } from "./actions"
import { buttonClasses } from "@/components/ui/Button"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsPending(true)
    await requestPasswordReset(email)
    setIsPending(false)
    setSent(true)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-sunken px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-[36rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/20 blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-b from-accent to-accent-hover text-white shadow-accent">
            <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
              <rect x="4" y="3" width="12" height="14" rx="1.5" />
              <path d="M7 7h6M7 10h6M7 13h3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="mt-4 text-lg font-semibold tracking-tight text-ink">Reset your password</h1>
          <p className="mt-1 text-sm text-ink-soft">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
          {sent ? (
            <p className="text-sm text-ink-soft">
              If an account exists for that email, a reset link is on its way. Check your inbox (and spam
              folder).
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ink">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button type="submit" disabled={isPending} className={buttonClasses("primary", "mt-2 w-full")}>
                {isPending ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-ink-soft">
          <Link href="/login" className="text-accent hover:text-accent-hover">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
