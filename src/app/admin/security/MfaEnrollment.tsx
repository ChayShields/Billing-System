"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { buttonClasses } from "@/components/ui/Button"

type Factor = { id: string; status: string }

export default function MfaEnrollment() {
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(true)
  const [factor, setFactor] = useState<Factor | null>(null)

  const [enrolling, setEnrolling] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)

  async function refresh() {
    const { data } = await supabase.auth.mfa.listFactors()
    const verified = data?.totp.find((f) => f.status === "verified") ?? null
    setFactor(verified)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function startEnroll() {
    setError("")
    setIsPending(true)
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" })
    setIsPending(false)
    if (enrollError || !data) {
      setError(enrollError?.message ?? "Couldn't start setup.")
      return
    }
    setPendingFactorId(data.id)
    setQrCode(data.totp.qr_code)
    setSecret(data.totp.secret)
    setEnrolling(true)
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault()
    if (!pendingFactorId) return
    setError("")
    setIsPending(true)

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: pendingFactorId,
    })
    if (challengeError || !challenge) {
      setError(challengeError?.message ?? "Couldn't verify.")
      setIsPending(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: pendingFactorId,
      challengeId: challenge.id,
      code,
    })
    setIsPending(false)
    if (verifyError) {
      setError(verifyError.message)
      return
    }

    setEnrolling(false)
    setQrCode(null)
    setSecret(null)
    setPendingFactorId(null)
    setCode("")
    await refresh()
  }

  async function disable() {
    if (!factor) return
    if (!confirm("Turn off two-factor authentication for your account?")) return
    setIsPending(true)
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
    setIsPending(false)
    if (unenrollError) {
      setError(unenrollError.message)
      return
    }
    await refresh()
  }

  async function cancelEnroll() {
    if (pendingFactorId) await supabase.auth.mfa.unenroll({ factorId: pendingFactorId })
    setEnrolling(false)
    setQrCode(null)
    setSecret(null)
    setPendingFactorId(null)
    setCode("")
    setError("")
  }

  if (loading) return <p className="text-sm text-ink-soft">Checking...</p>

  if (factor) {
    return (
      <div>
        <p className="flex items-center gap-1.5 text-sm text-status-paid-text">
          <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4 shrink-0">
            <path d="M4 10.5 8 14l8-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Two-factor authentication is on
        </p>
        {error && <p className="mt-2 text-xs text-status-overdue-text">{error}</p>}
        <button
          type="button"
          disabled={isPending}
          onClick={disable}
          className="mt-3 text-xs font-medium text-ink-faint hover:text-status-overdue-text disabled:opacity-50"
        >
          Turn off
        </button>
      </div>
    )
  }

  if (enrolling) {
    return (
      <form onSubmit={confirmEnroll} className="flex flex-col gap-3">
        <p className="text-xs text-ink-soft">
          Scan this with an authenticator app (Google Authenticator, Authy, 1Password), then enter the code it
          shows.
        </p>
        {qrCode && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrCode} alt="Scan with your authenticator app" className="mx-auto h-40 w-40 rounded-xl border border-border" />
        )}
        {secret && (
          <p className="break-all rounded-xl bg-surface-sunken px-3 py-2 text-center text-xs text-ink-faint">
            {secret}
          </p>
        )}
        {error && <p className="text-xs text-status-overdue-text">{error}</p>}
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="rounded-xl border border-border px-3 py-2 text-center text-sm tracking-[0.4em] text-ink shadow-xs focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={cancelEnroll}
            className={buttonClasses("secondary", "flex-1 justify-center")}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || code.length !== 6}
            className={buttonClasses("primary", "flex-1 justify-center")}
          >
            {isPending ? "Confirming..." : "Confirm"}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <p className="text-xs text-ink-soft">
        Not set up yet. Adds a code from your phone as a second step when logging in.
      </p>
      {error && <p className="mt-2 text-xs text-status-overdue-text">{error}</p>}
      <button
        type="button"
        disabled={isPending}
        onClick={startEnroll}
        className={buttonClasses("secondary", "mt-3 w-full")}
      >
        Set up two-factor authentication
      </button>
    </div>
  )
}
