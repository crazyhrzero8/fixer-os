import { createHash } from "crypto";
import { SYNTHETIC_CITIZEN } from "@/data/seed";

export const LEDGER_VERSION = "1.0.0";
export type LedgerActor = "citizen" | "portal" | "agent" | "system";
export interface LedgerEvent { id: string; caseId: string; ts: number; actor: LedgerActor; type: string; payload: Record<string, unknown>; prevHash: string; hash: string; }
export interface CaseRecord { id: string; title: string; status: "OPEN" | "ESCALATED" | "RESOLVED"; facts: typeof SYNTHETIC_CITIZEN; events: LedgerEvent[]; }

const GENESIS_HASH = "0".repeat(64);
const CASE_ID = "synthetic-epfo-001";
function stablePayload(payload: Record<string, unknown>) { return JSON.stringify(payload, Object.keys(payload).sort()); }
export function hashEvent(event: Omit<LedgerEvent, "hash">): string { return createHash("sha256").update(`${event.prevHash}|${event.ts}|${event.actor}|${event.type}|${stablePayload(event.payload)}`).digest("hex"); }
function event(caseId: string, id: string, ts: number, actor: LedgerActor, type: string, payload: Record<string, unknown>, prevHash: string): LedgerEvent { const draft = { id, caseId, ts, actor, type, payload, prevHash }; return { ...draft, hash: hashEvent(draft) }; }
function seedCase(): CaseRecord {
  const verified = event(CASE_ID, "evt-001", 1761000000000, "citizen", "FACTS_VERIFIED", { requestedMemberIdName: SYNTHETIC_CITIZEN.nameAsPerEmployer, primaryUanName: SYNTHETIC_CITIZEN.nameAsPerAadhaar, bankIfsc: SYNTHETIC_CITIZEN.bankIfsc, bankIfscValid: SYNTHETIC_CITIZEN.bankIfscValid }, GENESIS_HASH);
  const rejected = event(CASE_ID, "evt-002", 1761604800000, "portal", "CLAIM_REJECTED", { reason: "Name on requested member ID and Primary UAN does not match", portalState: "REJECTED", simulatedDays: 7 }, verified.hash);
  const locked = event(CASE_ID, "evt-003", 1761691200000, "portal", "GRIEVANCE_LOCKED_OUT", { reason: "Invalid tracking ID", nextGrievanceAllowedDays: 30 }, rejected.hash);
  return { id: CASE_ID, title: "PF advance false rejection", status: "OPEN", facts: SYNTHETIC_CITIZEN, events: [verified, rejected, locked] };
}
let activeCase = seedCase();
export function getCase(caseId = CASE_ID): CaseRecord | null { return caseId === CASE_ID ? activeCase : null; }
export function resetCase(): CaseRecord { activeCase = seedCase(); return activeCase; }
export function appendEvent(actor: LedgerActor, type: string, payload: Record<string, unknown>): LedgerEvent { const previous = activeCase.events.at(-1); const next = event(activeCase.id, `evt-${String(activeCase.events.length + 1).padStart(3, "0")}`, Date.now(), actor, type, payload, previous?.hash ?? GENESIS_HASH); activeCase = { ...activeCase, events: [...activeCase.events, next] }; return next; }
export function setCaseStatus(status: CaseRecord["status"]) { activeCase = { ...activeCase, status }; }
export function verifyLedger(caseRecord: CaseRecord) { let previousHash = GENESIS_HASH; for (const entry of caseRecord.events) { const expected = hashEvent({ id: entry.id, caseId: entry.caseId, ts: entry.ts, actor: entry.actor, type: entry.type, payload: entry.payload, prevHash: entry.prevHash }); if (entry.prevHash !== previousHash || entry.hash !== expected) return { valid: false, brokenAt: entry.id, eventCount: caseRecord.events.length }; previousHash = entry.hash; } return { valid: true, brokenAt: null, eventCount: caseRecord.events.length }; }
export const SYNTHETIC_CASE_ID = CASE_ID;
