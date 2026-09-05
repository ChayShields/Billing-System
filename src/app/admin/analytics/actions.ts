"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function disconnectGoogleAnalytics() {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from("google_oauth_connection")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000")
  if (error) throw new Error(error.message)

  revalidatePath("/admin/analytics")
}
