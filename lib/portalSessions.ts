import { randomBytes } from "crypto";
import { initialPortalSnapshot, transitionPortal, type PortalAction, type PortalSnapshot } from "@/lib/portalFsm";
import { APP_CONFIG } from "./config";

interface PortalSession { snapshot: PortalSnapshot; captcha: string; otp: string; otpExpiry: number; lastSeen: number; captchaAttempts: number; otpAttempts: number; }
const sessions = new Map<string, PortalSession>();

function sweep() {
  const cutoff = Date.now() - APP_CONFIG.portalSessionTtlMs;
  for (const [sid, session] of sessions) if (session.lastSeen < cutoff) sessions.delete(sid);
}

function newCaptcha(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const raw = randomBytes(APP_CONFIG.captchaLength);
  return [...raw].map((byte) => alphabet[byte % alphabet.length]).join("");
}

function newOtp(): string {
  // 6-digit OTP, native crypto, no dep — ponytail rung 3 (stdlib)
  return String(100000 + (randomBytes(3).readUIntBE(0, 3) % 900000));
}

function createSession(): PortalSession {
  return { snapshot: initialPortalSnapshot(), captcha: newCaptcha(), otp: newOtp(), otpExpiry: Date.now() + 5 * 60_000, lastSeen: Date.now(), captchaAttempts: 0, otpAttempts: 0 };
}

export function getOrCreateSession(sid: string): PortalSession {
  sweep();
  const existing = sessions.get(sid);
  if (existing) {
    existing.lastSeen = Date.now();
    return existing;
  }
  const fresh = createSession();
  sessions.set(sid, fresh);
  return fresh;
}

export function getCaptcha(sid: string): string {
  return getOrCreateSession(sid).captcha;
}

export function getOtpForTest(sid: string): string {
  // only for synthetic demo — never in prod govt system
  return getOrCreateSession(sid).otp;
}

export function refreshCaptcha(sid: string): string {
  const s = getOrCreateSession(sid);
  s.captcha = newCaptcha();
  s.captchaAttempts = 0;
  s.lastSeen = Date.now();
  return s.captcha;
}

export function refreshOtp(sid: string): string {
  const s = getOrCreateSession(sid);
  s.otp = newOtp();
  s.otpExpiry = Date.now() + 5 * 60_000;
  s.otpAttempts = 0;
  s.lastSeen = Date.now();
  return s.otp;
}

export function applyAction(sid: string, action: PortalAction, value?: string): PortalSnapshot {
  const session = getOrCreateSession(sid);
  session.lastSeen = Date.now();

  if (action === "REFRESH_CAPTCHA") {
    session.captcha = newCaptcha();
    session.captchaAttempts++;
    return session.snapshot;
  }
  if (action === "RESEND_OTP") {
    session.otp = newOtp();
    session.otpExpiry = Date.now() + 5 * 60_000;
    session.otpAttempts = 0;
    // keep snapshot in OTP_REQUIRED but refresh message
    session.snapshot = transitionPortal(session.snapshot, action);
    return session.snapshot;
  }
  if (action === "VERIFY_CAPTCHA") {
    // value may be JSON {captcha, uan, password} or plain captcha (back-compat)
    let captchaVal = value ?? "";
    let uan = "";
    let password = "";
    try {
      const parsed = value ? JSON.parse(value) : null;
      if (parsed && typeof parsed === "object" && "captcha" in parsed) {
        captchaVal = String((parsed as Record<string, unknown>).captcha ?? "");
        uan = String((parsed as Record<string, unknown>).uan ?? "");
        password = String((parsed as Record<string, unknown>).password ?? "");
      }
    } catch { captchaVal = value ?? ""; }
    const captchaOk = captchaVal.trim().toUpperCase() === session.captcha;
    if (!captchaOk) {
      session.captcha = newCaptcha();
      session.captchaAttempts++;
      return session.snapshot;
    }
    // captcha ok — now validate UAN/password against synthetic seed (server-side, not client)
    // SYNTHETIC_CITIZEN.evaluation* is synthetic demo credential — never real data
    if (uan || password) {
      const expectedUan = "100000000000";
      const expectedPass = "demo1234";
      if (uan !== expectedUan || password !== expectedPass) {
        session.captcha = newCaptcha();
        return session.snapshot;
      }
    }
    // success: issue new OTP and transition
    session.otp = newOtp();
    session.otpExpiry = Date.now() + 5 * 60_000;
    session.otpAttempts = 0;
    session.snapshot = transitionPortal(session.snapshot, action);
    return session.snapshot;
  }
  if (action === "VERIFY_OTP") {
    const otpVal = (value ?? "").trim();
    if (Date.now() > session.otpExpiry) {
      session.otp = newOtp();
      session.otpExpiry = Date.now() + 5 * 60_000;
      return session.snapshot;
    }
    if (otpVal !== session.otp) {
      session.otpAttempts++;
      if (session.otpAttempts >= 3) {
        // too many attempts — refresh OTP for safety
        session.otp = newOtp();
        session.otpExpiry = Date.now() + 5 * 60_000;
        session.otpAttempts = 0;
      }
      return session.snapshot;
    }
    session.snapshot = transitionPortal(session.snapshot, action);
    return session.snapshot;
  }
  session.snapshot = transitionPortal(session.snapshot, action);
  return session.snapshot;
}
