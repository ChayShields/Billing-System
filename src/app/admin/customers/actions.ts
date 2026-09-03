"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { SITE_URL } from "@/lib/business-details"
import { requireAdmin } from "@/lib/auth"

export async function createCustomer(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      website: String(formData.get("website") ?? "") || null,
      address: String(formData.get("address") ?? "") || null,
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)

  revalidatePath("/admin/customers")
  redirect(`/admin/customers/${data.id}`)
}

export async function updateCustomer(customerId: string, formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from("customers")
    .update({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      website: String(formData.get("website") ?? "") || null,
      address: String(formData.get("address") ?? "") || null,
    })
    .eq("id", customerId)

  if (error) throw new Error(error.message)

  revalidatePath("/admin/customers")
  revalidatePath(`/admin/customers/${customerId}`)
  redirect(`/admin/customers/${customerId}`)
}

// Creates a login for a customer so they can view their own invoices in
// /portal. Uses the admin client (secret key) - only ever called from
// this server action, never exposed to the browser.
export async function createCustomerLogin(customerId: string, email: string) {
  await requireAdmin()
  const admin = createAdminClient()

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(),
  })
  // A duplicate email is an expected, explainable case (this exact email
  // already has a login elsewhere - another customer, or even Chay's own
  // admin account), not a real crash. Handle it here rather than throwing:
  // Next.js strips the real error message before it reaches the browser
  // in production, so a generic throw would only ever show a vague
  // "something went wrong" with no way to tell what actually happened.
  if (createError?.code === "email_exists") {
    redirect(`/admin/customers/${customerId}?loginError=duplicate`)
  }
  if (createError) throw new Error(createError.message)

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    role: "customer",
    customer_id: customerId,
  })
  if (profileError) throw new Error(profileError.message)

  // The account and profile above are the part that matters - they're
  // already committed. Don't let a failed confirmation email (rate
  // limit, an unreachable domain, a Supabase SMTP hiccup) throw an
  // unhandled error and leave Chay looking at a crash with no idea
  // whether the login actually got created. Log it and let the page's
  // "Reset password" button (below) be the retry path instead.
  const { error: resetError } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/reset-password`,
  })
  if (resetError) {
    console.error(`Login created for ${email}, but the setup email failed to send:`, resetError.message)
  }

  revalidatePath(`/admin/customers/${customerId}`)
}

// Adds a recurring billing item (e.g. yearly hosting/domain renewal) for a
// customer. The generate-recurring-invoices cron picks these up and
// auto-creates + auto-sends an invoice 14 days before each due date.
export async function createRecurringItem(customerId: string, formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from("recurring_items").insert({
    customer_id: customerId,
    description: String(formData.get("description") ?? ""),
    amount: Number(formData.get("amount") ?? 0),
    interval_unit: String(formData.get("interval_unit") ?? "year"),
    next_due_date: String(formData.get("next_due_date") ?? ""),
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/admin/customers/${customerId}`)
}

// Cancels a recurring item - kept as a row (not deleted) so past invoices
// it generated still show what created them if that's ever worth knowing,
// it just stops being picked up by the cron.
export async function cancelRecurringItem(recurringItemId: string, customerId: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from("recurring_items")
    .update({ active: false })
    .eq("id", recurringItemId)

  if (error) throw new Error(error.message)

  revalidatePath(`/admin/customers/${customerId}`)
}

// Sends a fresh "set your password" link to an existing customer login -
// used when Chay needs to reset a customer's password (forgotten,
// suspected compromised, etc.), not just at first creation.
export async function resetCustomerPassword(customerId: string, email: string) {
  await requireAdmin()
  const admin = createAdminClient()

  const { error } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/reset-password`,
  })
  if (error) {
    console.error(`Password reset email to ${email} failed to send:`, error.message)
  }

  revalidatePath(`/admin/customers/${customerId}`)
}

// Creates a new admin login and emails them a link to set their own
// password - same shape as createCustomerLogin, but role: "admin" and no
// customer_id. Scales to any number of admins; nothing here is hardcoded
// to a single account.
export async function inviteAdmin(formData: FormData) {
  await requireAdmin()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const admin = createAdminClient()

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(),
  })
  if (createError?.code === "email_exists") {
    redirect(`/admin/customers?adminError=duplicate`)
  }
  if (createError) throw new Error(createError.message)

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    role: "admin",
  })
  if (profileError) throw new Error(profileError.message)

  const { error: resetError } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/reset-password`,
  })
  if (resetError) {
    console.error(`Admin login created for ${email}, but the setup email failed to send:`, resetError.message)
  }

  revalidatePath("/admin/customers")
}

// Revokes an admin's access entirely (deletes the auth user, which cascades
// to their profile row). Guarded against removing yourself or the last
// remaining admin, so the account can never be locked out of its own
// billing system.
export async function removeAdmin(userId: string) {
  const me = await requireAdmin()
  if (userId === me.id) {
    throw new Error("You can't remove your own admin access.")
  }

  const admin = createAdminClient()
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin")

  if ((count ?? 0) <= 1) {
    throw new Error("Can't remove the last admin.")
  }

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)

  revalidatePath("/admin/customers")
}
