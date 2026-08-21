import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { applyAction } from "@/lib/portalSessions";
import { clientKey, rateLimit } from "@/lib/ratelimit";

const bodySchema = z.object({ action: z.enum(["VERIFY_CAPTCHA", "SUBMIT_ADVANCE_CLAIM", "ADVANCE_DAY", "OPEN_GRIEVANCE", "SUBMIT_GRIEVANCE", "RESET"]) });
const SESSION_COOKIE = "portal_sid";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "portal"));
  if (!limit.allowed) return NextResponse.json({ error: `Too many requests. Retry in ${limit.retryAfterSeconds}s.` }, { status: 429 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const jar = await cookies();
  let sid = jar.get(SESSION_COOKIE)?.value;
  if (!sid) {
    sid = crypto.randomUUID();
    jar.set(SESSION_COOKIE, sid, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 1800 });
  }
  const snapshot = parsed.data.action === "RESET" ? applyAction(sid, "RESET") : applyAction(sid, parsed.data.action);
  return NextResponse.json({ snapshot });
}
