import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Customer, Invoice, InvoiceItem } from "@/lib/types"
import EditInvoiceForm from "../EditInvoiceForm"

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", id)
    .single<Invoice & { invoice_items: InvoiceItem[] }>()

  if (!invoice) notFound()
  if (invoice.status !== "draft") redirect(`/admin/invoices/${id}`)

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("name")
    .returns<Customer[]>()

  return (
    <div>
      <Link href={`/admin/invoices/${id}`} className="text-sm text-ink-soft hover:text-ink">
        &larr; {invoice.invoice_number}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Edit {invoice.invoice_number}</h1>
      <EditInvoiceForm invoice={invoice} customers={customers ?? []} />
    </div>
  )
}
