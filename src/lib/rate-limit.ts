// Lightweight sliding-window rate limiter using a module-level Map.
//
// Trade-off: state is per-process, not distributed. In a serverless
// environment each function instance has its own counter — meaning the
// effective limit is per-instance rather than per-IP globally.
// For a distributed limit, swap this for @upstash/ratelimit + Upstash Redis.
// At the scale of this app (small team, Neon free tier) this is sufficient
// and requires no extra infrastructure.

type BucketEntry = { count: number; windowStart: number };

const buckets = new Map<string, BucketEntry>();

const WINDOW_MS = 60_000; // 1 minute

/**
 * Returns `true` if the key is within the allowed rate, `false` if it should
 * be blocked.
 */
export function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Prevent unbounded growth. Called lazily on each check.
export function evictExpired() {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > WINDOW_MS) {
      buckets.delete(key);
    }
  }
}
