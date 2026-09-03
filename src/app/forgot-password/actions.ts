"use server"

import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { SITE_URL } from "@/lib/business-details"
import { checkRateLimit } from "@/lib/rate-limit"

export async function requestPasswordReset(email: string) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const byEmail = checkRateLimit(`reset-email:${email.toLowerCase()}`, 3, 15 * 60 * 1000)
  const byIp = checkRateLimit(`reset-ip:${ip}`, 10, 15 * 60 * 1000)

  // Silently no-op when rate limited rather than surfacing a different
  // message - the caller already always sees "if an account exists...",
  // so this can't be used to distinguish "rate limited" from "no such email".
  if (!byEmail.allowed || !byIp.allowed) return

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/reset-password`,
  })
  // Always report success regardless of whether the email exists - avoids
  // leaking which addresses are registered.
}
