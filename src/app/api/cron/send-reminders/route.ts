import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendPaymentReminder } from "@/lib/email"
import type { Customer, Invoice } from "@/lib/types"

// Vercel Cron calls this daily. Sends one reminder email per invoice, the
// first time it's within 7 days of its due date (and not yet paid/overdue) -
// reminder_sent_at guards against sending more than once even if this
// misses a day and the invoice sits in the window for a while.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const sevenDaysOut = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const { data: dueInvoices, error } = await supabase
    .from("invoices")
    .select("*, customers(*)")
    .eq("status", "sent")
    .is("reminder_sent_at", null)
    .not("due_date", "is", null)
    .gte("due_date", todayStr)
    .lte("due_date", sevenDaysOut)
    .returns<(Invoice & { customers: Customer })[]>()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const reminded: string[] = []
  for (const invoice of dueInvoices ?? []) {
    await sendPaymentReminder(invoice, invoice.customers)
    await supabase
      .from("invoices")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", invoice.id)
    reminded.push(invoice.invoice_number)
  }

  return NextResponse.json({ remindersSent: reminded.length, invoices: reminded })
}
