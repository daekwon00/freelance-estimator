const requests = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60_000,
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const timestamps = (requests.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    const retryAfter = Math.ceil((timestamps[0] + windowMs - now) / 1000);
    requests.set(key, timestamps);
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  requests.set(key, timestamps);
  return { allowed: true };
}
