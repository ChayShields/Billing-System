import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getGoogleAuthUrl } from "@/lib/google-analytics"

export async function GET(request: NextRequest) {
  await requireAdmin()

  const state = randomBytes(16).toString("hex")
  const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`
  const authUrl = getGoogleAuthUrl(redirectUri, state)

  const response = NextResponse.redirect(authUrl)
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })
  return response
}
