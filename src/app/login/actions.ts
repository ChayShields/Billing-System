"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const { allowed, retryAfterSeconds } = checkRateLimit(`login:${ip}`, 8, 5 * 60 * 1000)
  if (!allowed) {
    redirect(`/login?error=${encodeURIComponent(`Too many attempts. Try again in ${retryAfterSeconds}s.`)}`)
  }

  const supabase = await createClient()
  const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !signInData.user) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Sign in failed.")}`)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", signInData.user.id)
    .single()

  redirect(profile?.role === "admin" ? "/admin" : "/portal")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
