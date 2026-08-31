import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createCustomer } from "./actions"
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
      <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {(customers ?? []).map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.company ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  </tr>
                ))}
                {(customers ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                      No customers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Add a customer</h2>
            <form action={createCustomer} className="mt-4 flex flex-col gap-3">
              <input
                name="name"
                placeholder="Name"
                required
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
              <input
                name="company"
                placeholder="Company (optional)"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
              <input
                name="phone"
                placeholder="Phone (optional)"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
              <textarea
                name="address"
                placeholder="Address (optional)"
                rows={2}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                className="mt-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Add customer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
