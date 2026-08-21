const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const hits = new Map<string, number[]>();

export function rateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((ts) => now - ts < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    hits.set(key, [...recent, now]);
    return { allowed: false, retryAfterSeconds };
  }
  hits.set(key, [...recent, now]);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clientKey(request: Request, route: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return `${route}:${forwarded?.split(",")[0]?.trim() ?? "local"}`;
}
