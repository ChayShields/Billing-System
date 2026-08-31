import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"

export async function getSessionProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, customer_id")
    .eq("id", user.id)
    .single<Profile>()

  return profile
}

export async function requireAdmin() {
  const profile = await getSessionProfile()
  if (!profile || profile.role !== "admin") redirect("/login")
  return profile
}

export async function requireCustomer() {
  const profile = await getSessionProfile()
  if (!profile || profile.role !== "customer" || !profile.customer_id) redirect("/login")
  return profile
}
