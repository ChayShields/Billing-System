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

  // Admin has a verified TOTP factor but this session never completed the
  // second step (e.g. a stale aal1 cookie, or someone jumping straight to
  // an /admin URL) - send them to finish it rather than letting the role
  // check alone be enough.
  const supabase = await createClient()
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    redirect("/login/mfa")
  }

  return profile
}

export async function requireCustomer() {
  const profile = await getSessionProfile()
  if (!profile || profile.role !== "customer" || !profile.customer_id) redirect("/login")
  return profile
}
