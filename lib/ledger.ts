import { createHash } from "crypto";
import { SYNTHETIC_CITIZEN, SYNTHETIC_TXN } from "../data/seed";
import { caseStore } from "./store";

export const LEDGER_VERSION = "2.0.0";
export type LedgerActor = "citizen" | "portal" | "agent" | "system";
export interface LedgerEvent { id: string; caseId: string; ts: number; actor: LedgerActor; type: string; payload: Record<string, unknown>; prevHash: string; hash: string; }
export type CaseStatus = "OPEN" | "ESCALATED" | "RESOLVED";
export interface CaseRecord { id: string; kind: "epfo-false-rejection" | "payment-tat-breach"; title: string; status: CaseStatus; facts: Record<string, unknown>; events: LedgerEvent[]; }

const GENESIS_HASH = "0".repeat(64);

function stablePayload(payload: Record<string, unknown>) { return JSON.stringify(payload, Object.keys(payload).sort()); }
export function hashEvent(event: Omit<LedgerEvent, "hash">): string {
  return createHash("sha256").update(`${event.prevHash}|${event.ts}|${event.actor}|${event.type}|${stablePayload(event.payload)}`).digest("hex");
}

function makeEvent(caseId: string, index: number, ts: number, actor: LedgerActor, type: string, payload: Record<string, unknown>, prevHash: string): LedgerEvent {
  const draft = { id: `evt-${String(index).padStart(3, "0")}`, caseId, ts, actor, type, payload, prevHash };
  return { ...draft, hash: hashEvent(draft) };
}

function seedEpfoCase(): CaseRecord {
  const id = "synthetic-epfo-001";
  const e1 = makeEvent(id, 1, 1761000000000, "citizen", "FACTS_VERIFIED", { requestedMemberIdName: SYNTHETIC_CITIZEN.nameAsPerEmployer, primaryUanName: SYNTHETIC_CITIZEN.nameAsPerAadhaar, bankIfsc: SYNTHETIC_CITIZEN.bankIfsc, bankIfscValid: SYNTHETIC_CITIZEN.bankIfscValid }, GENESIS_HASH);
  const e2 = makeEvent(id, 2, 1761604800000, "portal", "CLAIM_REJECTED", { reason: "Name on requested member ID and Primary UAN does not match", portalState: "REJECTED", simulatedDays: 7 }, e1.hash);
  const e3 = makeEvent(id, 3, 1761691200000, "portal", "GRIEVANCE_LOCKED_OUT", { reason: "Invalid tracking ID", nextGrievanceAllowedDays: 30 }, e2.hash);
  return { id, kind: "epfo-false-rejection", title: "PF advance false rejection", status: "OPEN", facts: { ...SYNTHETIC_CITIZEN }, events: [e1, e2, e3] };
}

function seedPaymentCase(): CaseRecord {
  const id = "synthetic-irctc-001";
  const e1 = makeEvent(id, 1, 1754805840000, "citizen", "FACTS_VERIFIED", { rrn: SYNTHETIC_TXN.rrn, amountPaise: SYNTHETIC_TXN.amountPaise, debitedAt: SYNTHETIC_TXN.debitedAt, ticketIssued: SYNTHETIC_TXN.ticketIssued }, GENESIS_HASH);
  const e2 = makeEvent(id, 2, 1754892240000, "portal", "PAYMENT_DEBITED_SERVICE_NOT_ISSUED", { rrn: SYNTHETIC_TXN.rrn, message: "Payment Success, Ticket Booking Failed" }, e1.hash);
  return { id, kind: "payment-tat-breach", title: "Tatkal payment debited, no ticket", status: "OPEN", facts: { ...SYNTHETIC_TXN }, events: [e1, e2] };
}

function seedAll(): void {
  const s = caseStore();
  s.save(seedEpfoCase());
  s.save(seedPaymentCase());
}
seedAll();

export function getCase(caseId: string): CaseRecord | null { return caseStore().get(caseId); }
export function listCases() { return caseStore().list(); }
export function resetCase(caseId: string): CaseRecord | null {
  const fresh = [seedEpfoCase(), seedPaymentCase()].find((c) => c.id === caseId);
  if (!fresh) return null;
  caseStore().save(fresh);
  return fresh;
}
export function appendEvent(caseId: string, actor: LedgerActor, type: string, payload: Record<string, unknown>): LedgerEvent | null {
  const record = caseStore().get(caseId);
  if (!record) return null;
  const previous = record.events.at(-1);
  const next = makeEvent(record.id, record.events.length + 1, Date.now(), actor, type, payload, previous?.hash ?? GENESIS_HASH);
  caseStore().save({ ...record, events: [...record.events, next] });
  return next;
}
export function setCaseStatus(caseId: string, status: CaseStatus): void {
  const record = caseStore().get(caseId);
  if (record) caseStore().save({ ...record, status });
}
export function verifyLedger(caseRecord: CaseRecord) {
  let previousHash = GENESIS_HASH;
  for (const entry of caseRecord.events) {
    const expected = hashEvent({ id: entry.id, caseId: entry.caseId, ts: entry.ts, actor: entry.actor, type: entry.type, payload: entry.payload, prevHash: entry.prevHash });
    if (entry.prevHash !== previousHash || entry.hash !== expected) return { valid: false, brokenAt: entry.id, eventCount: caseRecord.events.length };
    previousHash = entry.hash;
  }
  return { valid: true, brokenAt: null, eventCount: caseRecord.events.length };
}
export const CASE_IDS = { epfo: "synthetic-epfo-001", irctc: "synthetic-irctc-001" } as const;
