"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { buttonClasses } from "@/components/ui/Button"

export default function LoginMfaPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function check() {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (!aal || aal.nextLevel !== "aal2" || aal.currentLevel === "aal2") {
        // Nothing to step up for (already aal2, or no factor enrolled) -
        // this page isn't relevant, send them on.
        router.replace("/admin")
        return
      }
      setReady(true)
    }
    check()
  }, [supabase, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsPending(true)

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
    if (factorsError || !factors) {
      setError(factorsError?.message ?? "Couldn't load your security factor.")
      setIsPending(false)
      return
    }

    const factor = factors.totp[0]
    if (!factor) {
      setError("No authenticator app is set up on this account.")
      setIsPending(false)
      return
    }

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factor.id,
    })
    if (challengeError || !challenge) {
      setError(challengeError?.message ?? "Couldn't start verification.")
      setIsPending(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.id,
      code,
    })
    if (verifyError) {
      setError(verifyError.message)
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
              <rect x="4" y="4" width="12" height="12" rx="2.5" />
              <path d="M7 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="mt-4 text-lg font-semibold tracking-tight text-ink">Enter your code</h1>
          <p className="mt-1 text-sm text-ink-soft">Open your authenticator app for the 6-digit code.</p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
          {!ready ? (
            <p className="text-sm text-ink-soft">Checking...</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <p className="rounded-xl bg-status-overdue-bg px-3 py-2 text-sm text-status-overdue-text">
                  {error}
                </p>
              )}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-ink">
                  Verification code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2 text-center text-lg tracking-[0.5em] text-ink shadow-xs focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button
                type="submit"
                disabled={isPending || code.length !== 6}
                className={buttonClasses("primary", "mt-2 w-full")}
              >
                {isPending ? "Verifying..." : "Verify"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
