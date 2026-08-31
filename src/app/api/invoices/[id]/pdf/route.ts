import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { renderInvoicePdf } from "@/lib/invoice-pdf"
import type { Customer, Invoice, InvoiceItem } from "@/lib/types"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Relies on the same RLS policies as every other invoice read: an admin
  // can fetch any invoice, a customer only their own. No extra role check
  // needed here beyond that.
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customers(*), invoice_items(*)")
    .eq("id", id)
    .single<Invoice & { customers: Customer; invoice_items: InvoiceItem[] }>()

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (invoice.status !== "paid") {
    return NextResponse.json({ error: "PDF is only available once an invoice is paid" }, { status: 403 })
  }

  const pdf = await renderInvoicePdf(invoice, invoice.customers, invoice.invoice_items)

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
    },
  })
}
