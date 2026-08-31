import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createCustomer } from "./actions"
import { buttonClasses } from "@/components/ui/Button"
import type { Customer } from "@/lib/types"

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("name")
    .returns<Customer[]>()

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Customers</h1>
      <p className="mt-1 text-sm text-ink-soft">Everyone you invoice, in one place.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-3">
            {(customers ?? []).map((c) => (
              <Link
                key={c.id}
                href={`/admin/customers/${c.id}`}
                className="group flex items-center justify-between rounded-3xl border border-border bg-surface p-5 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-sm font-semibold text-accent">
                    {c.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-ink group-hover:text-accent">{c.name}</p>
                    <p className="text-xs text-ink-faint">{c.company ?? c.email}</p>
                  </div>
                </div>
                <span className="hidden text-sm text-ink-soft sm:block">{c.email}</span>
              </Link>
            ))}
            {(customers ?? []).length === 0 && (
              <p className="rounded-3xl border border-dashed border-border p-10 text-center text-ink-faint">
                No customers yet - add your first one.
              </p>
            )}
          </div>
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
        </div>
      </div>
    </div>
  )
}
