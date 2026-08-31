"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { buttonClasses } from "@/components/ui/Button"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [ready, setReady] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true)
    })

    // The recovery link's session may already have been established by the
    // time this listener attaches - check directly too, not just the event.
    supabase.auth.getSession().then(({ data }) => {
      setReady((current) => current ?? Boolean(data.session))
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }

    setIsPending(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setIsPending(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .single()

    router.replace(profile?.role === "admin" ? "/admin" : "/portal")
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
          <h1 className="mt-4 text-lg font-semibold tracking-tight text-ink">Set a new password</h1>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
          {ready === null && <p className="text-sm text-ink-soft">Verifying your reset link...</p>}

          {ready === false && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-ink-soft">
                This password reset link is invalid or has expired. Request a new one from the login page.
              </p>
              <Link href="/forgot-password" className={buttonClasses("secondary", "justify-center")}>
                Request a new link
              </Link>
            </div>
          )}

          {ready === true && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <p className="rounded-xl bg-status-overdue-bg px-3 py-2 text-sm text-status-overdue-text">
                  {error}
                </p>
              )}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ink">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button type="submit" disabled={isPending} className={buttonClasses("primary", "mt-2 w-full")}>
                {isPending ? "Saving..." : "Set new password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
