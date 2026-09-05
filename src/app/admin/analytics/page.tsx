import Link from "next/link"
import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { buttonClasses } from "@/components/ui/Button"
import DisconnectButton from "./DisconnectButton"

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  await requireAdmin()
  const params = await searchParams
  const supabase = await createClient()

  const { data: connection } = await supabase
    .from("google_oauth_connection")
    .select("connected_at")
    .maybeSingle()

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Analytics</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Connect Google Analytics once here, then set each customer&apos;s GA4 property on their profile to give them
        access.
      </p>

      {params.error && (
        <p className="mt-4 rounded-2xl bg-status-overdue-bg p-3 text-sm text-status-overdue-text">
          Something went wrong connecting your Google account - try again.
        </p>
      )}

      <div className="mt-6 max-w-md rounded-3xl border border-border bg-surface shadow-sm p-5">
        <h2 className="text-sm font-semibold text-ink">Google account connection</h2>
        {connection ? (
          <>
            <p className="mt-2 text-sm text-ink-soft">
              Connected since{" "}
              {new Date(connection.connected_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              .
            </p>
            <div className="mt-4">
              <DisconnectButton />
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-ink-soft">
              Not connected yet. Connect the Google account you use to manage your clients&apos; GA4 properties.
            </p>
            <Link href="/api/auth/google/connect" className={buttonClasses("primary", "mt-4")}>
              Connect Google Analytics
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
