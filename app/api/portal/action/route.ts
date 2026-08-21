import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { applyAction, getCaptcha } from "@/lib/portalSessions";
import { APP_CONFIG } from "@/lib/config";
import { clientKey, rateLimit } from "@/lib/ratelimit";

const bodySchema = z.object({
  action: z.enum(["VERIFY_CAPTCHA", "SUBMIT_ADVANCE_CLAIM", "ADVANCE_DAY", "OPEN_GRIEVANCE", "SUBMIT_GRIEVANCE", "RESET"]),
  value: z.string().max(16).optional()
});
const SESSION_COOKIE = "portal_sid";

async function ensureSessionCookie(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  const sid = crypto.randomUUID();
  jar.set(SESSION_COOKIE, sid, { httpOnly: true, sameSite: "lax", path: "/", maxAge: APP_CONFIG.portalSessionTtlMs / 1000 });
  return sid;
}

export async function GET() {
  const sid = await ensureSessionCookie();
  const limit = rateLimit(`portal-captcha:${sid}`);
  if (!limit.allowed) return NextResponse.json({ error: `Too many requests. Retry in ${limit.retryAfterSeconds}s.` }, { status: 429 });
  const captcha = getCaptcha(sid);
  return NextResponse.json({ captcha, spaced: captcha.split("").join(" ") });
}

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "portal"));
  if (!limit.allowed) return NextResponse.json({ error: `Too many requests. Retry in ${limit.retryAfterSeconds}s.` }, { status: 429 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const sid = await ensureSessionCookie();
  const snapshot = applyAction(sid, parsed.data.action, parsed.data.value);
  if (parsed.data.action === "VERIFY_CAPTCHA" && snapshot.state === "LOGIN_FRICTION") {
    return NextResponse.json({ snapshot, error: "Invalid captcha characters. A new challenge has been issued; kindly retry." });
  }
  return NextResponse.json({ snapshot });
}
