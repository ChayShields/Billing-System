import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { buttonClasses } from "@/components/ui/Button"
import StatusBadge from "@/components/ui/StatusBadge"
import type { Customer, Invoice, RecurringItem } from "@/lib/types"
import { createCustomerLogin, resetCustomerPassword, createRecurringItem } from "../actions"
import CancelRecurringItemButton from "./CancelRecurringItemButton"

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

  const { data: recurringItems } = await supabase
    .from("recurring_items")
    .select("*")
    .eq("customer_id", id)
    .eq("active", true)
    .order("next_due_date")
    .returns<RecurringItem[]>()

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

  async function resetAction() {
    "use server"
    await resetCustomerPassword(customer!.id, customer!.email)
  }

  async function addRecurringAction(formData: FormData) {
    "use server"
    await createRecurringItem(customer!.id, formData)
  }

  const formatGBP = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n)

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-ink-soft hover:text-ink">
        &larr; Customers
      </Link>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{customer.name}</h1>
          {customer.company && <p className="text-sm text-ink-soft">{customer.company}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/customers/${customer.id}/edit`} className={buttonClasses("secondary", "flex-1 justify-center sm:flex-none")}>
            Edit
          </Link>
          <Link href={`/admin/invoices/new?customer=${customer.id}`} className={buttonClasses("primary", "flex-1 justify-center sm:flex-none")}>
            New Invoice
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Invoices</h2>
          <div className="mt-3 flex flex-col gap-3">
            {(invoices ?? []).map((inv) => (
              <Link
                key={inv.id}
                href={`/admin/invoices/${inv.id}`}
                className="group flex items-center justify-between rounded-3xl border border-border bg-surface p-4 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
              >
                <div>
                  <p className="font-medium text-ink group-hover:text-accent">{inv.invoice_number}</p>
                  <p className="text-xs text-ink-faint">Due {inv.due_date ?? "–"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium tabular-nums text-ink">{formatGBP(inv.total)}</span>
                  <StatusBadge status={inv.status} />
                </div>
              </Link>
            ))}
            {(invoices ?? []).length === 0 && (
              <p className="rounded-3xl border border-dashed border-border p-8 text-center text-ink-faint">
                No invoices yet.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-border bg-surface shadow-sm p-5">
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
                <dt className="text-xs text-ink-faint">Website</dt>
                <dd className="text-ink">
                  {customer.website ? (
                    <a
                      href={customer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent-hover"
                    >
                      {customer.website}
                    </a>
                  ) : (
                    "–"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-faint">Address</dt>
                <dd className="whitespace-pre-line text-ink">{customer.address ?? "–"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-border bg-surface shadow-sm p-5">
            <h2 className="text-sm font-semibold text-ink">Recurring billing</h2>
            <p className="mt-1 text-xs text-ink-soft">
              Auto-generates and sends an invoice 14 days before each renewal.
            </p>

            {(recurringItems ?? []).length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {recurringItems!.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-sunken px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{item.description}</p>
                      <p className="text-xs text-ink-faint">
                        {formatGBP(item.amount)} / {item.interval_unit} &middot; next{" "}
                        {item.next_due_date}
                      </p>
                    </div>
                    <CancelRecurringItemButton recurringItemId={item.id} customerId={customer.id} />
                  </div>
                ))}
              </div>
            )}

            <form action={addRecurringAction} className="mt-4 flex flex-col gap-2">
              <input
                name="description"
                placeholder="e.g. Web Hosting - Annual"
                required
                className="rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Amount"
                  required
                  className="rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <select
                  name="interval_unit"
                  defaultValue="year"
                  className="rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="year">Yearly</option>
                  <option value="month">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-ink-faint">First due date</label>
                <input
                  name="next_due_date"
                  type="date"
                  required
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm text-ink shadow-xs focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button type="submit" className={buttonClasses("secondary", "mt-1 w-full")}>
                Add recurring item
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-border bg-surface shadow-sm p-5">
            <h2 className="text-sm font-semibold text-ink">Portal access</h2>
            {existingProfile ? (
              <div className="mt-2">
                <p className="flex items-center gap-1.5 text-sm text-status-paid-text">
                  <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4 shrink-0">
                    <path d="M4 10.5 8 14l8-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Login active
                </p>
                <p className="mt-2 text-xs text-ink-soft">
                  Logs in with <span className="font-medium text-ink">{customer.email}</span>
                </p>
                <form action={resetAction} className="mt-3">
                  <p className="text-xs text-ink-faint">
                    Sends {customer.email} a fresh link to set a new password.
                  </p>
                  <button type="submit" className={buttonClasses("secondary", "mt-2 w-full")}>
                    Reset password
                  </button>
                </form>
              </div>
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
