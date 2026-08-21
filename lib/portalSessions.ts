import { initialPortalSnapshot, transitionPortal, type PortalAction, type PortalSnapshot } from "@/lib/portalFsm";

interface PortalSession { snapshot: PortalSnapshot; lastSeen: number; }
const SESSION_TTL_MS = 30 * 60_000;
const sessions = new Map<string, PortalSession>();

function sweep() {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [sid, session] of sessions) if (session.lastSeen < cutoff) sessions.delete(sid);
}

export function getOrCreateSession(sid: string): PortalSnapshot {
  sweep();
  const existing = sessions.get(sid);
  if (existing) {
    existing.lastSeen = Date.now();
    return existing.snapshot;
  }
  const fresh = initialPortalSnapshot();
  sessions.set(sid, { snapshot: fresh, lastSeen: Date.now() });
  return fresh;
}

export function applyAction(sid: string, action: PortalAction): PortalSnapshot {
  const current = getOrCreateSession(sid);
  const next = transitionPortal(current, action);
  const existing = sessions.get(sid);
  if (existing) existing.snapshot = next;
  else sessions.set(sid, { snapshot: next, lastSeen: Date.now() });
  return next;
}
