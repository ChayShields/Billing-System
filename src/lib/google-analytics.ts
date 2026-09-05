import { OAuth2Client } from "google-auth-library"
import { createAdminClient } from "@/lib/supabase/admin"

const ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly"

function getOAuthClient(redirectUri: string) {
  return new OAuth2Client({
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    redirectUri,
  })
}

export function getGoogleAuthUrl(redirectUri: string, state: string) {
  return getOAuthClient(redirectUri).generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [ANALYTICS_SCOPE],
    state,
  })
}

// Google only returns a refresh_token on the first consent for a given
// account/app pair unless prompt=consent forces it every time (set above),
// so this should always succeed - but if Chay ever revokes access from his
// Google account settings instead of using the in-app disconnect button,
// the next connect attempt could land here without one.
export async function exchangeGoogleCode(redirectUri: string, code: string) {
  const { tokens } = await getOAuthClient(redirectUri).getToken(code)
  if (!tokens.refresh_token) {
    throw new Error("Google didn't return a refresh token - disconnect and try connecting again.")
  }
  return tokens.refresh_token
}

async function getAccessToken() {
  const admin = createAdminClient()
  const { data } = await admin.from("google_oauth_connection").select("refresh_token").maybeSingle()
  if (!data) return null

  const client = getOAuthClient("")
  client.setCredentials({ refresh_token: data.refresh_token })
  const { token } = await client.getAccessToken()
  return token ?? null
}

export type GA4PropertyOption = { propertyId: string; label: string }

type AccountSummary = {
  displayName: string
  propertySummaries?: { property: string; displayName: string }[]
}

// Lists every GA4 property Chay's connected Google account can see, so the
// admin UI can offer a picker instead of him copying a raw property ID out
// of Google Analytics by hand.
export async function listGA4Properties(): Promise<GA4PropertyOption[]> {
  const accessToken = await getAccessToken()
  if (!accessToken) return []

  const options: GA4PropertyOption[] = []
  let pageToken: string | undefined

  do {
    const url = new URL("https://analyticsadmin.googleapis.com/v1beta/accountSummaries")
    url.searchParams.set("pageSize", "200")
    if (pageToken) url.searchParams.set("pageToken", pageToken)

    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
    if (!res.ok) break

    const body: { accountSummaries?: AccountSummary[]; nextPageToken?: string } = await res.json()
    for (const account of body.accountSummaries ?? []) {
      for (const property of account.propertySummaries ?? []) {
        options.push({
          propertyId: property.property.replace("properties/", ""),
          label: `${property.displayName} (${account.displayName})`,
        })
      }
    }
    pageToken = body.nextPageToken
  } while (pageToken)

  return options
}

type GA4Row = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }
type GA4Response = { rows?: GA4Row[] }

export type GA4Summary = {
  sessions: number
  users: number
  pageviews: number
  topPages: { path: string; views: number }[]
}

async function runReport(accessToken: string, propertyId: string, body: object): Promise<GA4Response | null> {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) return null
  return res.json()
}

export async function getGA4Summary(propertyId: string): Promise<GA4Summary | null> {
  const accessToken = await getAccessToken()
  if (!accessToken) return null

  const dateRanges = [{ startDate: "30daysAgo", endDate: "today" }]

  const totals = await runReport(accessToken, propertyId, {
    dateRanges,
    metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "screenPageViews" }],
  })
  if (!totals) return null
  const totalsRow = totals.rows?.[0]?.metricValues
  const sessions = Number(totalsRow?.[0]?.value ?? 0)
  const users = Number(totalsRow?.[1]?.value ?? 0)
  const pageviews = Number(totalsRow?.[2]?.value ?? 0)

  const pages = await runReport(accessToken, propertyId, {
    dateRanges,
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 5,
  })
  const topPages = (pages?.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "",
    views: Number(row.metricValues?.[0]?.value ?? 0),
  }))

  return { sessions, users, pageviews, topPages }
}
