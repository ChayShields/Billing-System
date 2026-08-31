"use server"

import { createClient } from "@/lib/supabase/server"
import { SITE_URL } from "@/lib/business-details"

export async function requestPasswordReset(email: string) {
  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/reset-password`,
  })
  // Always report success regardless of whether the email exists - avoids
  // leaking which addresses are registered.
}
