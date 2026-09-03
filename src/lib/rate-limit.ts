type Bucket = { count: number; resetAt: number }

// Per-server-instance, in-memory - not shared across Vercel's serverless
// instances. Good enough as a first line of defense for this app's real
// traffic (Chay + a handful of customers); if abuse ever gets past this,
// move to an Upstash Redis-backed limiter instead.
const buckets = new Map<string, Bucket>()

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}
