"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { SITE_URL } from "@/lib/business-details"

export async function createCustomer(formData: FormData) {
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
  const admin = createAdminClient()

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(),
  })
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

// Sends a fresh "set your password" link to an existing customer login -
// used when Chay needs to reset a customer's password (forgotten,
// suspected compromised, etc.), not just at first creation.
export async function resetCustomerPassword(customerId: string, email: string) {
  const admin = createAdminClient()

  const { error } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/reset-password`,
  })
  if (error) {
    console.error(`Password reset email to ${email} failed to send:`, error.message)
  }

  revalidatePath(`/admin/customers/${customerId}`)
}
