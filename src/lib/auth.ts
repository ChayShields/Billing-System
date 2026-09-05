import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { ModuleName, Profile } from "@/lib/types"

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

// Gates a module's portal pages (booking, GA dashboard, CRM, etc.) behind
// whether this specific customer has that module switched on. Every
// module page should call this instead of requireCustomer() directly, so
// a customer can't reach a module's pages just by guessing the URL -
// enforced here server-side, not by whether the admin UI happens to show
// a nav link for it.
export async function requireModule(module: ModuleName) {
  const profile = await requireCustomer()
  const supabase = await createClient()

  const { data } = await supabase
    .from("customer_modules")
    .select("id")
    .eq("customer_id", profile.customer_id!)
    .eq("module", module)
    .maybeSingle()

  if (!data) redirect("/portal")
  return profile
}
