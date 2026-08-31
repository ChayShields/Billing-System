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
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {(customers ?? []).map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/customers/${c.id}`} className="font-medium text-ink hover:text-accent">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">{c.company ?? "–"}</td>
                    <td className="px-5 py-3.5 text-ink-soft">{c.email}</td>
                  </tr>
                ))}
                {(customers ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-ink-faint">
                      No customers yet - add your first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-border bg-surface shadow-sm p-5">
            <h2 className="text-sm font-semibold text-ink">Add a customer</h2>
            <form action={createCustomer} className="mt-4 flex flex-col gap-3">
              <input
                name="name"
                placeholder="Name"
                required
                className="rounded-lg border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="rounded-lg border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <input
                name="company"
                placeholder="Company (optional)"
                className="rounded-lg border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <input
                name="phone"
                placeholder="Phone (optional)"
                className="rounded-lg border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <textarea
                name="address"
                placeholder="Address (optional)"
                rows={2}
                className="rounded-lg border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
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
