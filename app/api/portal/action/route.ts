import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { applyAction, getCaptcha, getOtpForTest, getOrCreateSession, otpStatus, refreshCaptcha } from "@/lib/portalSessions";
import { APP_CONFIG } from "@/lib/config";
import { clientKey, rateLimit } from "@/lib/ratelimit";

const bodySchema = z.object({
  action: z.enum(["VERIFY_CAPTCHA", "VERIFY_OTP", "RESEND_OTP", "REFRESH_CAPTCHA", "OPEN_CLAIM_FORM", "VIEW_DASHBOARD", "VIEW_PASSBOOK", "VIEW_KYC", "SUBMIT_ADVANCE_CLAIM", "ADVANCE_DAY", "OPEN_GRIEVANCE", "SUBMIT_GRIEVANCE", "RESET"]),
  value: z.string().max(256).optional(),
  uan: z.string().max(20).optional(),
  password: z.string().max(64).optional(),
  captcha: z.string().max(16).optional(),
  otp: z.string().max(10).optional()
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
  // Normalize VERIFY_CAPTCHA payload to include uan/password/captcha for server validation
  let valueForSession = parsed.data.value;
  if (parsed.data.action === "VERIFY_CAPTCHA" && (parsed.data.uan || parsed.data.password || parsed.data.captcha)) {
    valueForSession = JSON.stringify({ captcha: parsed.data.captcha ?? parsed.data.value ?? "", uan: parsed.data.uan ?? "", password: parsed.data.password ?? "" });
  }
  if (parsed.data.action === "VERIFY_OTP" && parsed.data.otp) valueForSession = parsed.data.otp;
  if (parsed.data.action === "VERIFY_OTP" && parsed.data.value) valueForSession = parsed.data.value;

  // Handle explicit refresh — ponytail: one random captcha per click, native crypto
  if (parsed.data.action === "REFRESH_CAPTCHA") {
    const newCap = refreshCaptcha(sid);
    const snap = getOrCreateSession(sid).snapshot;
    return NextResponse.json({ snapshot: snap, captcha: newCap, spaced: newCap.split("").join(" ") });
  }

  const snapshot = applyAction(sid, parsed.data.action, valueForSession);
  if (parsed.data.action === "VERIFY_CAPTCHA" && snapshot.state === "LOGIN_FRICTION") {
    return NextResponse.json({ snapshot, error: "Invalid UAN / password / captcha. New captcha issued — kindly retry. (Demo: UAN 100000000000 · demo1234)" });
  }
  if (parsed.data.action === "VERIFY_OTP" && snapshot.state === "DASHBOARD") {
    // Login success → dashboard. Show synthetic OTP once more for evaluation banner.
    return NextResponse.json({ snapshot, demoOtp: getOtpForTest(sid), otp: otpStatus(sid) });
  }
  if (parsed.data.action === "VERIFY_OTP" && snapshot.state === "OTP_REQUIRED") {
    const otp = otpStatus(sid);
    return NextResponse.json({
      snapshot,
      // Demo surface always shows the CURRENT code — the old screenshot/code is stale after rotation
      demoOtp: otp.lockedSeconds > 0 ? undefined : getOtpForTest(sid),
      otp,
      error: otp.lockedSeconds > 0
        ? "Too many failed attempts. OTP blocked for 2 minutes (synthetic cooldown)."
        : "Invalid or expired OTP. A new OTP has been issued (synthetic)."
    });
  }
  if (parsed.data.action === "VERIFY_CAPTCHA" && snapshot.state === "OTP_REQUIRED") {
    // Captcha passed → expose demo OTP inline for evaluation (real EPFO sends SMS; never here)
    return NextResponse.json({ snapshot, demoOtp: getOtpForTest(sid), otp: otpStatus(sid) });
  }
  if (parsed.data.action === "RESEND_OTP") {
    const otp = otpStatus(sid);
    if (otp.lockedSeconds > 0) {
      return NextResponse.json({ snapshot, otp, error: "Resend unavailable during the 2-minute cooldown (synthetic)." });
    }
    return NextResponse.json({ snapshot, demoOtp: getOtpForTest(sid), otp });
  }
  return NextResponse.json({ snapshot });
}
