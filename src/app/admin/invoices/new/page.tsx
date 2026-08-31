import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { Customer } from "@/lib/types"
import NewInvoiceForm from "./NewInvoiceForm"

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>
}) {
  const { customer } = await searchParams
  const supabase = await createClient()
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("name")
    .returns<Customer[]>()

  if (!customers || customers.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">New Invoice</h1>
        <p className="mt-4 text-sm text-ink-soft">
          You need at least one customer before creating an invoice.{" "}
          <Link href="/admin/customers" className="font-medium text-accent underline">
            Add a customer
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div>
      <Link href="/admin/invoices" className="text-sm text-ink-soft hover:text-ink">
        &larr; Invoices
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">New Invoice</h1>
      <NewInvoiceForm customers={customers} defaultCustomerId={customer} />
    </div>
  )
}
