import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSessionProfile } from "@/lib/auth"
import { createCustomer, inviteAdmin } from "./actions"
import { buttonClasses } from "@/components/ui/Button"
import CustomerList from "./CustomerList"
import RemoveAdminButton from "./RemoveAdminButton"
import type { Customer } from "@/lib/types"

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ adminError?: string }>
}) {
  const { adminError } = await searchParams
  const supabase = await createClient()
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("name")
    .returns<Customer[]>()

  const sessionProfile = await getSessionProfile()
  const admin = createAdminClient()
  const { data: adminProfiles } = await admin.from("profiles").select("id").eq("role", "admin")
  const { data: usersPage } = await admin.auth.admin.listUsers()
  const admins = (adminProfiles ?? []).map((p) => ({
    id: p.id,
    email: usersPage?.users.find((u) => u.id === p.id)?.email ?? "(unknown)",
    isYou: p.id === sessionProfile?.id,
  }))

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Customers</h1>
      <p className="mt-1 text-sm text-ink-soft">Everyone you invoice, in one place.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomerList customers={customers ?? []} />
        </div>

        <div>
          <div className="rounded-3xl border border-border bg-surface shadow-sm p-5">
            <h2 className="text-sm font-semibold text-ink">Add a customer</h2>
            <form action={createCustomer} className="mt-4 flex flex-col gap-3">
              <input
                name="name"
                placeholder="Name"
                required
                className="rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <input
                name="company"
                placeholder="Company (optional)"
                className="rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <input
                name="phone"
                placeholder="Phone (optional)"
                className="rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <input
                name="website"
                type="url"
                placeholder="Website (optional)"
                className="rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <textarea
                name="address"
                placeholder="Address (optional)"
                rows={2}
                className="rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button type="submit" className={buttonClasses("primary", "mt-1")}>
                Add customer
              </button>
            </form>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-surface shadow-sm p-5">
            <h2 className="text-sm font-semibold text-ink">Team</h2>
            {adminError === "duplicate" && (
              <p className="mt-2 rounded-xl bg-status-overdue-bg px-3 py-2 text-xs text-status-overdue-text">
                Couldn&apos;t invite that email - it&apos;s already registered to another account (an admin
                or a customer).
              </p>
            )}
            <div className="mt-4 flex flex-col gap-3">
              {admins.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-sm font-semibold text-accent">
                    {a.email.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink" title={a.email}>
                      {a.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {a.isYou && <span className="text-xs text-ink-faint">You</span>}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-status-paid-bg px-2.5 py-0.5 text-xs font-semibold text-status-paid-text">
                        Admin
                      </span>
                    </div>
                  </div>
                  {!a.isYou && admins.length > 1 && <RemoveAdminButton userId={a.id} email={a.email} />}
                </div>
              ))}
            </div>

            <form action={inviteAdmin} className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              <label className="text-xs font-medium text-ink-soft">Invite an admin</label>
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button type="submit" className={buttonClasses("secondary", "mt-1 w-full")}>
                Send invite
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
