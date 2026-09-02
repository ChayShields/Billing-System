import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Vercel Cron calls this on a schedule (see vercel.json). Authenticated via
// CRON_SECRET so it can't be triggered by anyone who finds the URL - Vercel
// sends it as a Bearer token automatically for its own cron invocations.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("invoices")
    .update({ status: "overdue" })
    .eq("status", "sent")
    .lt("due_date", today)
    .select("id, invoice_number")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ markedOverdue: data?.length ?? 0, invoices: data })
}
