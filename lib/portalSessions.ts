import { randomBytes } from "crypto";
import { initialPortalSnapshot, transitionPortal, type PortalAction, type PortalSnapshot } from "@/lib/portalFsm";
import { APP_CONFIG } from "./config";

interface PortalSession { snapshot: PortalSnapshot; captcha: string; lastSeen: number; }
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

function createSession(): PortalSession {
  return { snapshot: initialPortalSnapshot(), captcha: newCaptcha(), lastSeen: Date.now() };
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

export function applyAction(sid: string, action: PortalAction, value?: string): PortalSnapshot {
  const session = getOrCreateSession(sid);
  session.lastSeen = Date.now();
  if (action === "VERIFY_CAPTCHA") {
    const ok = (value ?? "").trim().toUpperCase() === session.captcha;
    if (!ok) {
      session.captcha = newCaptcha();
      return session.snapshot;
    }
    session.snapshot = transitionPortal(session.snapshot, action);
    return session.snapshot;
  }
  session.snapshot = transitionPortal(session.snapshot, action);
  return session.snapshot;
}
