import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { buttonClasses } from "@/components/ui/Button"
import StatusBadge from "@/components/ui/StatusBadge"
import type { Customer, Invoice } from "@/lib/types"
import { createCustomerLogin } from "../actions"

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

  const formatGBP = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n)

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-ink-soft hover:text-ink">
        &larr; Customers
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{customer.name}</h1>
          {customer.company && <p className="text-sm text-ink-soft">{customer.company}</p>}
        </div>
        <Link href={`/admin/invoices/new?customer=${customer.id}`} className={buttonClasses("primary")}>
          New Invoice
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Invoices</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-5 py-3">Number</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Due</th>
                </tr>
              </thead>
              <tbody>
                {(invoices ?? []).map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/invoices/${inv.id}`} className="font-medium text-ink hover:text-accent">
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">{formatGBP(inv.total)}</td>
                    <td className="px-5 py-3.5 text-ink-soft">{inv.due_date ?? "–"}</td>
                  </tr>
                ))}
                {(invoices ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-ink-faint">
                      No invoices yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-surface shadow-sm p-5">
            <h2 className="text-sm font-semibold text-ink">Contact</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-ink-faint">Email</dt>
                <dd className="text-ink">{customer.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-faint">Phone</dt>
                <dd className="text-ink">{customer.phone ?? "–"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-faint">Address</dt>
                <dd className="whitespace-pre-line text-ink">{customer.address ?? "–"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-surface shadow-sm p-5">
            <h2 className="text-sm font-semibold text-ink">Portal access</h2>
            {existingProfile ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-status-paid-text">
                <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
                  <path d="M4 10.5 8 14l8-8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Login already created
              </p>
            ) : (
              <form action={inviteAction} className="mt-2">
                <p className="text-xs text-ink-soft">
                  Creates a login and emails {customer.email} a link to set their password.
                </p>
                <button type="submit" className={buttonClasses("secondary", "mt-3 w-full")}>
                  Create portal login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
