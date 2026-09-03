"use server"

import { createClient } from "@/lib/supabase/server"
import { validatePasswordStrength } from "@/lib/password"

export async function updatePassword(password: string) {
  const strengthError = validatePasswordStrength(password)
  if (strengthError) return { error: strengthError }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  return { error: null }
}
