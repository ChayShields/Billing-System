"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { sendPaidConfirmation } from "@/lib/email"
import type { Customer, Invoice } from "@/lib/types"

export type NewInvoiceItem = {
  description: string
  quantity: number
  unit_price: number
}

export async function createInvoice(input: {
  customerId: string
  dueDate: string | null
  notes: string | null
  items: NewInvoiceItem[]
}) {
  const supabase = await createClient()

  const total = input.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      customer_id: input.customerId,
      due_date: input.dueDate,
      notes: input.notes,
      total,
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)

  if (input.items.length > 0) {
    const { error: itemsError } = await supabase.from("invoice_items").insert(
      input.items.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))
    )
    if (itemsError) throw new Error(itemsError.message)
  }

  revalidatePath("/admin/invoices")
  redirect(`/admin/invoices/${invoice.id}`)
}

export async function markInvoicePaid(invoiceId: string) {
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from("invoices")
    .update({ status: "paid", paid_date: new Date().toISOString().slice(0, 10) })
    .eq("id", invoiceId)
    .select("*, customers(*)")
    .single<Invoice & { customers: Customer }>()

  if (error) throw new Error(error.message)

  await sendPaidConfirmation(invoice, invoice.customers)

  revalidatePath(`/admin/invoices/${invoiceId}`)
  revalidatePath("/admin/invoices")
}

export async function updateInvoiceStatus(invoiceId: string, status: "draft" | "sent" | "overdue") {
  const supabase = await createClient()
  const { error } = await supabase.from("invoices").update({ status }).eq("id", invoiceId)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/invoices/${invoiceId}`)
  revalidatePath("/admin/invoices")
}
