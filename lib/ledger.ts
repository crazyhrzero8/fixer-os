import { createHash, createHmac } from "crypto";
import { SYNTHETIC_CITIZEN, SYNTHETIC_TXN } from "../data/seed";
import { caseStore, registerSeeds } from "./store";

export const LEDGER_VERSION = "2.1.0";
export type LedgerActor = "citizen" | "portal" | "agent" | "system";

export interface LedgerEvent {
  id: string;
  caseId: string;
  ts: number;
  actor: LedgerActor;
  type: string;
  payload: Record<string, unknown>;
  prevHash: string;
  signature: string;
  hash: string;
}

export type CaseStatus = "OPEN" | "ESCALATED" | "RESOLVED";

export interface CaseRecord {
  id: string;
  kind: "epfo-false-rejection" | "payment-tat-breach";
  title: string;
  status: CaseStatus;
  facts: Record<string, unknown>;
  events: LedgerEvent[];
}

const GENESIS_HASH = "0".repeat(64);

const ACTOR_SECRETS: Record<LedgerActor, string> = {
  citizen: "secret_citizen_actor_signature_key_2026",
  portal: "secret_portal_actor_signature_key_2026",
  agent: "secret_agent_actor_signature_key_2026",
  system: "secret_system_actor_signature_key_2026"
};

function stablePayload(payload: Record<string, unknown>) {
  return JSON.stringify(payload, Object.keys(payload).sort());
}

export function signEventPayload(
  actor: LedgerActor,
  prevHash: string,
  ts: number,
  type: string,
  payload: Record<string, unknown>
): string {
  const secret = ACTOR_SECRETS[actor] || "secret_fallback";
  const data = `${prevHash}|${ts}|${type}|${stablePayload(payload)}`;
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function hashEvent(event: Omit<LedgerEvent, "hash">): string {
  const sig = event.signature || signEventPayload(event.actor, event.prevHash, event.ts, event.type, event.payload);
  return createHash("sha256")
    .update(`${event.prevHash}|${event.ts}|${event.actor}|${event.type}|${stablePayload(event.payload)}|${sig}`)
    .digest("hex");
}

function makeEvent(
  caseId: string,
  index: number,
  ts: number,
  actor: LedgerActor,
  type: string,
  payload: Record<string, unknown>,
  prevHash: string
): LedgerEvent {
  const signature = signEventPayload(actor, prevHash, ts, type, payload);
  const draft = { id: `evt-${String(index).padStart(3, "0")}`, caseId, ts, actor, type, payload, prevHash, signature };
  return { ...draft, hash: hashEvent(draft) };
}

function seedEpfoCase(): CaseRecord {
  const id = "synthetic-epfo-001";
  const e1 = makeEvent(id, 1, 1761000000000, "citizen", "FACTS_VERIFIED", { requestedMemberIdName: SYNTHETIC_CITIZEN.nameAsPerEmployer, primaryUanName: SYNTHETIC_CITIZEN.nameAsPerAadhaar, bankIfsc: SYNTHETIC_CITIZEN.bankIfsc, bankIfscValid: SYNTHETIC_CITIZEN.bankIfscValid }, GENESIS_HASH);
  // Portal held for 7 days
  const e2 = makeEvent(id, 2, 1761604800000, "portal", "CLAIM_REJECTED", { reason: "Name on requested member ID and Primary UAN does not match", portalState: "REJECTED", simulatedDays: 7 }, e1.hash);
  // Field held for 12 days: 1761604800000 + 12 * 86400000 = 1762641600000
  const e3 = makeEvent(id, 3, 1762641600000, "portal", "GRIEVANCE_LOCKED_OUT", { reason: "Invalid tracking ID", nextGrievanceAllowedDays: 30 }, e2.hash);
  return { id, kind: "epfo-false-rejection", title: "PF advance false rejection", status: "OPEN", facts: { ...SYNTHETIC_CITIZEN }, events: [e1, e2, e3] };
}

function seedPaymentCase(): CaseRecord {
  const id = "synthetic-irctc-001";
  const e1 = makeEvent(id, 1, 1754805840000, "citizen", "FACTS_VERIFIED", { rrn: SYNTHETIC_TXN.rrn, amountPaise: SYNTHETIC_TXN.amountPaise, debitedAt: SYNTHETIC_TXN.debitedAt, ticketIssued: SYNTHETIC_TXN.ticketIssued }, GENESIS_HASH);
  const e2 = makeEvent(id, 2, 1754892240000, "portal", "PAYMENT_DEBITED_SERVICE_NOT_ISSUED", { rrn: SYNTHETIC_TXN.rrn, message: "Payment Success, Ticket Booking Failed" }, e1.hash);
  return { id, kind: "payment-tat-breach", title: "Tatkal payment debited, no ticket", status: "OPEN", facts: { ...SYNTHETIC_TXN }, events: [e1, e2] };
}

function seedRamuCase(): CaseRecord {
  const id = "ramu-epfo-001";
  const e1 = makeEvent(id, 1, 1761000000000, "citizen", "FACTS_VERIFIED", { requestedMemberIdName: "Ramu Prasad", primaryUanName: "Ramu Prasad", bankIfsc: "BARB0MUMBAI", bankIfscValid: true }, GENESIS_HASH);
  // Portal held for 12 days
  const e2 = makeEvent(id, 2, 1762036800000, "portal", "CLAIM_REJECTED", { reason: "Employer verification pending", portalState: "REJECTED", simulatedDays: 12 }, e1.hash);
  // Field held for 18 days: 1762036800000 + 18 * 86400000 = 1763592000000
  const e3 = makeEvent(id, 3, 1763592000000, "portal", "GRIEVANCE_LOCKED_OUT", { reason: "Grievance submission disabled", nextGrievanceAllowedDays: 30 }, e2.hash);
  return { id, kind: "epfo-false-rejection", title: "Ramu: PF Withdrawal Delay", status: "OPEN", facts: { displayName: "Ramu Prasad", nameAsPerAadhaar: "Ramu Prasad", nameAsPerEmployer: "Ramu Prasad", bankIfsc: "BARB0MUMBAI", bankIfscValid: true, serviceYears: 5.2, enominationDone: true, claimTrackingId: "PF/2026/R/0022341", uan: "100000000002" }, events: [e1, e2, e3] };
}

function seedRadhikaCase(): CaseRecord {
  const id = "radhika-irctc-001";
  const e1 = makeEvent(id, 1, 1754805840000, "citizen", "FACTS_VERIFIED", { rrn: "RRN202608009988", amountPaise: 285000, debitedAt: "2026-08-10T10:04:00+05:30", ticketIssued: false }, GENESIS_HASH);
  const e2 = makeEvent(id, 2, 1754892240000, "portal", "PAYMENT_DEBITED_SERVICE_NOT_ISSUED", { rrn: "RRN202608009988", message: "Payment Success, Ticket Booking Failed" }, e1.hash);
  return { id, kind: "payment-tat-breach", title: "Radhika: Tatkal Ticket Failure", status: "OPEN", facts: { rrn: "RRN202608009988", amountPaise: 285000, merchant: "IRCTC Tatkal", debitedAt: "2026-08-10T10:04:00+05:30", ticketIssued: false, bankReverseDeadlineDays: 5, tatCompensationPerDayPaise: 10000, displayName: "Radhika Sharma", nameAsPerAadhaar: "Radhika Sharma", uan: "100000000003" }, events: [e1, e2] };
}

registerSeeds(() => [seedEpfoCase(), seedPaymentCase(), seedRamuCase(), seedRadhikaCase()]);

export function getSeedEvents(caseId: string): LedgerEvent[] {
  const seeds = [seedEpfoCase(), seedPaymentCase(), seedRamuCase(), seedRadhikaCase()];
  return seeds.find((c) => c.id === caseId)?.events || [];
}

export async function getCase(caseId: string): Promise<CaseRecord | null> {
  return await caseStore().get(caseId);
}

export async function listCases() {
  return await caseStore().list();
}

export async function resetCase(caseId: string): Promise<CaseRecord | null> {
  const fresh = [seedEpfoCase(), seedPaymentCase(), seedRamuCase(), seedRadhikaCase()].find((c) => c.id === caseId);
  if (!fresh) return null;
  await caseStore().save(fresh);
  return fresh;
}

export async function appendEvent(
  caseId: string,
  actor: LedgerActor,
  type: string,
  payload: Record<string, unknown>
): Promise<LedgerEvent | null> {
  const record = await caseStore().get(caseId);
  if (!record) return null;
  const previous = record.events.at(-1);
  const next = makeEvent(record.id, record.events.length + 1, Date.now(), actor, type, payload, previous?.hash ?? GENESIS_HASH);
  await caseStore().save({ ...record, events: [...record.events, next] });
  return next;
}

export async function setCaseStatus(caseId: string, status: CaseStatus): Promise<void> {
  const record = await caseStore().get(caseId);
  if (record) await caseStore().save({ ...record, status });
}

export function verifyLedger(caseRecord: CaseRecord) {
  let previousHash = GENESIS_HASH;
  for (const entry of caseRecord.events) {
    const expectedSig = signEventPayload(entry.actor, entry.prevHash, entry.ts, entry.type, entry.payload);
    const expectedHash = hashEvent({
      id: entry.id,
      caseId: entry.caseId,
      ts: entry.ts,
      actor: entry.actor,
      type: entry.type,
      payload: entry.payload,
      prevHash: entry.prevHash,
      signature: entry.signature
    });
    
    if (entry.signature !== expectedSig) {
      return { valid: false, brokenAt: entry.id, eventCount: caseRecord.events.length };
    }
    if (entry.prevHash !== previousHash || entry.hash !== expectedHash) {
      return { valid: false, brokenAt: entry.id, eventCount: caseRecord.events.length };
    }
    previousHash = entry.hash;
  }
  return { valid: true, brokenAt: null, eventCount: caseRecord.events.length };
}

export const CASE_IDS = { epfo: "synthetic-epfo-001", irctc: "synthetic-irctc-001" } as const;
