export const APP_CONFIG = {
  rateLimit: { windowMs: 60_000, maxRequests: 30 },
  portalSessionTtlMs: 30 * 60_000,
  captchaLength: 5,
  portal: { processingDays: 7 },
  sla: { perDayRupees: 100 },
  llm: { timeoutMs: 10_000, maxReasoningChars: 700 }
} as const;
