"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      address: String(formData.get("address") ?? "") || null,
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)

  revalidatePath("/admin/customers")
  redirect(`/admin/customers/${data.id}`)
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

  const { error: resetError } = await admin.auth.resetPasswordForEmail(email)
  if (resetError) throw new Error(resetError.message)

  revalidatePath(`/admin/customers/${customerId}`)
}
