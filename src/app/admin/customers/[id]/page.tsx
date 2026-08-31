import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Customer, Invoice } from "@/lib/types"
import { createCustomerLogin } from "../actions"

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single<Customer>()

  if (!customer) notFound()

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("customer_id", id)
    .order("issue_date", { ascending: false })
    .returns<Invoice[]>()

  const admin = createAdminClient()
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("customer_id", id)
    .maybeSingle()

  async function inviteAction() {
    "use server"
    await createCustomerLogin(customer!.id, customer!.email)
  }

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-slate-500 hover:text-slate-900">
        &larr; Customers
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{customer.name}</h1>
          <p className="text-sm text-slate-500">{customer.company}</p>
        </div>
        <Link
          href={`/admin/invoices/new?customer=${customer.id}`}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          New Invoice
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Invoices</h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Number</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Due</th>
                </tr>
              </thead>
              <tbody>
                {(invoices ?? []).map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/invoices/${inv.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[inv.status]}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Intl.NumberFormat("en-GB", {
                        style: "currency",
                        currency: "GBP",
                      }).format(inv.total)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{inv.due_date ?? "-"}</td>
                  </tr>
                ))}
                {(invoices ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      No invoices yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Contact</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-slate-400">Email</dt>
                <dd className="text-slate-700">{customer.email}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Phone</dt>
                <dd className="text-slate-700">{customer.phone ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Address</dt>
                <dd className="whitespace-pre-line text-slate-700">{customer.address ?? "-"}</dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <h2 className="text-sm font-semibold text-slate-900">Portal access</h2>
              {existingProfile ? (
                <p className="mt-2 text-sm text-green-700">Login already created.</p>
              ) : (
                <form action={inviteAction} className="mt-2">
                  <p className="text-xs text-slate-500">
                    Creates a login and emails {customer.email} a link to set their password.
                  </p>
                  <button
                    type="submit"
                    className="mt-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Create portal login
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
