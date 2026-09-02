import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendInvoiceIssued } from "@/lib/email"
import type { Customer, Invoice, InvoiceItem, RecurringItem } from "@/lib/types"

function advance(dateStr: string, unit: "month" | "year") {
  const d = new Date(dateStr)
  if (unit === "year") d.setFullYear(d.getFullYear() + 1)
  else d.setMonth(d.getMonth() + 1)
  return d.toISOString().slice(0, 10)
}

// Vercel Cron calls this daily. For each active recurring item (yearly
// hosting/domain renewals, etc.) within 14 days of its next due date,
// creates a real invoice and sends it immediately - no draft step, per
// Chay's call - then advances that item's next_due_date by its interval so
// it repeats on its own. Advancing the date is what prevents this firing
// twice for the same cycle even if the cron runs again before the next one.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date()
  const fourteenDaysOut = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const { data: dueItems, error } = await supabase
    .from("recurring_items")
    .select("*, customers(*)")
    .eq("active", true)
    .lte("next_due_date", fourteenDaysOut)
    .returns<(RecurringItem & { customers: Customer })[]>()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const generated: string[] = []

  for (const item of dueItems ?? []) {
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        customer_id: item.customer_id,
        status: "sent",
        due_date: item.next_due_date,
        total: item.amount,
        notes: `Recurring: ${item.description}`,
      })
      .select("*")
      .single<Invoice>()

    if (invErr) {
      console.error(`Failed to create recurring invoice for ${item.description}:`, invErr.message)
      continue
    }

    const { data: invoiceItem, error: itemErr } = await supabase
      .from("invoice_items")
      .insert({
        invoice_id: invoice.id,
        description: item.description,
        quantity: 1,
        unit_price: item.amount,
      })
      .select("*")
      .single<InvoiceItem>()

    if (itemErr) {
      console.error(`Failed to create line item for recurring invoice ${invoice.invoice_number}:`, itemErr.message)
      continue
    }

    await sendInvoiceIssued(invoice, item.customers, [invoiceItem])

    await supabase
      .from("recurring_items")
      .update({ next_due_date: advance(item.next_due_date, item.interval_unit) })
      .eq("id", item.id)

    generated.push(invoice.invoice_number)
  }

  return NextResponse.json({ invoicesGenerated: generated.length, invoices: generated })
}
