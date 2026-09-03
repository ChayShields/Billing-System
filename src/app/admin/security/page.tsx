import { requireAdmin } from "@/lib/auth"
import MfaEnrollment from "./MfaEnrollment"

export default async function SecurityPage() {
  await requireAdmin()

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Security</h1>
      <p className="mt-1 text-sm text-ink-soft">Protect your own admin login.</p>

      <div className="mt-6 max-w-md rounded-3xl border border-border bg-surface shadow-sm p-5">
        <h2 className="text-sm font-semibold text-ink">Two-factor authentication</h2>
        <div className="mt-3">
          <MfaEnrollment />
        </div>
      </div>
    </div>
  )
}
