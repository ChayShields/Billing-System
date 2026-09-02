"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { sendInvoiceIssued, sendPaidConfirmation } from "@/lib/email"
import type { Customer, Invoice, InvoiceItem } from "@/lib/types"

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

// Marks an invoice "sent" and emails the customer the invoice itself -
// line items, total, and bank payment details - so they know what's
// owed and how to pay it.
export async function markInvoiceSent(invoiceId: string) {
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from("invoices")
    .update({ status: "sent" })
    .eq("id", invoiceId)
    .select("*, customers(*), invoice_items(*)")
    .single<Invoice & { customers: Customer; invoice_items: InvoiceItem[] }>()

  if (error) throw new Error(error.message)

  await sendInvoiceIssued(invoice, invoice.customers, invoice.invoice_items)

  revalidatePath(`/admin/invoices/${invoiceId}`)
  revalidatePath("/admin/invoices")
}

// Marks an invoice paid and emails the customer the same invoice, now
// showing a paid confirmation instead of payment instructions.
export async function markInvoicePaid(invoiceId: string) {
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from("invoices")
    .update({ status: "paid", paid_date: new Date().toISOString().slice(0, 10) })
    .eq("id", invoiceId)
    .select("*, customers(*), invoice_items(*)")
    .single<Invoice & { customers: Customer; invoice_items: InvoiceItem[] }>()

  if (error) throw new Error(error.message)

  await sendPaidConfirmation(invoice, invoice.customers, invoice.invoice_items)

  revalidatePath(`/admin/invoices/${invoiceId}`)
  revalidatePath("/admin/invoices")
}

// Re-fires the invoice email on demand without changing status - the
// customer lost it, asked again, etc. Sends whichever version matches the
// invoice's current status (paid confirmation if already paid, otherwise
// the standard "here's what you owe" email); doesn't apply to drafts,
// which were never issued in the first place.
export async function resendInvoice(invoiceId: string) {
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, customers(*), invoice_items(*)")
    .eq("id", invoiceId)
    .single<Invoice & { customers: Customer; invoice_items: InvoiceItem[] }>()

  if (error) throw new Error(error.message)
  if (invoice.status === "draft") throw new Error("Can't resend a draft invoice - send it first.")

  if (invoice.status === "paid") {
    await sendPaidConfirmation(invoice, invoice.customers, invoice.invoice_items)
  } else {
    await sendInvoiceIssued(invoice, invoice.customers, invoice.invoice_items)
  }
}

// Logs a partial (or final) payment against an invoice - for customers who
// pay across 2-3 months rather than in one go. Only flips the invoice to
// "paid" and sends the paid-confirmation email once the running total of
// all payments reaches the invoice's full amount; a partial payment just
// updates the balance shown, nothing gets emailed for it.
export async function recordPayment(invoiceId: string, formData: FormData) {
  const supabase = await createClient()

  const amount = Number(formData.get("amount") ?? 0)
  const paidDate = String(formData.get("paid_date") ?? "") || new Date().toISOString().slice(0, 10)

  const { error: insertError } = await supabase
    .from("invoice_payments")
    .insert({ invoice_id: invoiceId, amount, paid_date: paidDate })

  if (insertError) throw new Error(insertError.message)

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*, customers(*), invoice_items(*)")
    .eq("id", invoiceId)
    .single<Invoice & { customers: Customer; invoice_items: InvoiceItem[] }>()
  if (invoiceError) throw new Error(invoiceError.message)

  const { data: payments, error: paymentsError } = await supabase
    .from("invoice_payments")
    .select("amount")
    .eq("invoice_id", invoiceId)
    .returns<{ amount: number }[]>()
  if (paymentsError) throw new Error(paymentsError.message)

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  if (totalPaid >= invoice.total && invoice.status !== "paid") {
    const { error: updateError } = await supabase
      .from("invoices")
      .update({ status: "paid", paid_date: paidDate })
      .eq("id", invoiceId)
    if (updateError) throw new Error(updateError.message)

    await sendPaidConfirmation(invoice, invoice.customers, invoice.invoice_items)
  }

  revalidatePath(`/admin/invoices/${invoiceId}`)
  revalidatePath("/admin/invoices")
}

// Removes a payment entry (typo, duplicate, etc.). If the invoice had
// already been marked paid off the back of it, correctly reverts it back
// to "sent" now that the running total no longer covers the full amount -
// silently, no email, since this is a correction not a real status change.
export async function deletePayment(paymentId: string, invoiceId: string) {
  const supabase = await createClient()

  const { error: deleteError } = await supabase.from("invoice_payments").delete().eq("id", paymentId)
  if (deleteError) throw new Error(deleteError.message)

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("total, status")
    .eq("id", invoiceId)
    .single<{ total: number; status: string }>()
  if (invoiceError) throw new Error(invoiceError.message)

  const { data: payments, error: paymentsError } = await supabase
    .from("invoice_payments")
    .select("amount")
    .eq("invoice_id", invoiceId)
    .returns<{ amount: number }[]>()
  if (paymentsError) throw new Error(paymentsError.message)

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  if (invoice.status === "paid" && totalPaid < invoice.total) {
    const { error: revertError } = await supabase
      .from("invoices")
      .update({ status: "sent", paid_date: null })
      .eq("id", invoiceId)
    if (revertError) throw new Error(revertError.message)
  }

  revalidatePath(`/admin/invoices/${invoiceId}`)
  revalidatePath("/admin/invoices")
}

export async function updateInvoiceStatus(invoiceId: string, status: "draft" | "overdue") {
  const supabase = await createClient()
  const { error } = await supabase.from("invoices").update({ status }).eq("id", invoiceId)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/invoices/${invoiceId}`)
  revalidatePath("/admin/invoices")
}
