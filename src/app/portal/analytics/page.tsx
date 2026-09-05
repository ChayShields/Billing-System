import { requireModule } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { getGA4Summary } from "@/lib/google-analytics"
import type { Customer } from "@/lib/types"

export default async function PortalAnalyticsPage() {
  const profile = await requireModule("ga_dashboard")
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from("customers")
    .select("ga4_property_id")
    .eq("id", profile.customer_id!)
    .single<Pick<Customer, "ga4_property_id">>()

  const summary = customer?.ga4_property_id ? await getGA4Summary(customer.ga4_property_id) : null

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Analytics</h1>
      <p className="mt-1 text-sm text-ink-soft">Your website traffic over the last 30 days.</p>

      {!summary ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-ink-faint">
          Your analytics aren&apos;t connected yet - check back soon.
        </p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <StatTile label="Sessions" value={summary.sessions} />
            <StatTile label="Users" value={summary.users} />
            <StatTile label="Pageviews" value={summary.pageviews} />
          </div>

          <div className="mt-5 rounded-3xl border border-border bg-surface shadow-sm p-5">
            <h2 className="text-sm font-semibold text-ink">Top pages</h2>
            <div className="mt-3 flex flex-col divide-y divide-border">
              {summary.topPages.length === 0 ? (
                <p className="py-3 text-sm text-ink-faint">No page data yet.</p>
              ) : (
                summary.topPages.map((page, i) => (
                  <div key={page.path} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="flex min-w-0 items-center gap-2.5 text-sm text-ink">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-xs font-medium text-ink-faint">
                        {i + 1}
                      </span>
                      <span className="truncate">{page.path}</span>
                    </span>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-ink">
                      {new Intl.NumberFormat("en-GB").format(page.views)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm p-3 sm:p-4">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink sm:text-2xl">
        {new Intl.NumberFormat("en-GB").format(value)}
      </p>
    </div>
  )
}
