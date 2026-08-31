import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Uses the secret key, which bypasses row-level security. Server-only:
// never import this from a Client Component or route that exposes it
// to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
