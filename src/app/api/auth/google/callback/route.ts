import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { exchangeGoogleCode } from "@/lib/google-analytics"

export async function GET(request: NextRequest) {
  await requireAdmin()

  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const storedState = request.cookies.get("google_oauth_state")?.value

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/admin/analytics?error=1", request.url))
  }

  const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`

  try {
    const refreshToken = await exchangeGoogleCode(redirectUri, code)
    const supabase = await createClient()
    // Singleton table - only one Google account is ever connected, so clear
    // any previous row before storing the new one rather than tracking an
    // "active" flag across multiple rows.
    await supabase.from("google_oauth_connection").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    const { error } = await supabase.from("google_oauth_connection").insert({ refresh_token: refreshToken })
    if (error) throw new Error(error.message)
  } catch {
    return NextResponse.redirect(new URL("/admin/analytics?error=1", request.url))
  }

  const response = NextResponse.redirect(new URL("/admin/analytics?connected=1", request.url))
  response.cookies.delete("google_oauth_state")
  return response
}
