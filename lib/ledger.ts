import { createHash } from "crypto";

export const LEDGER_VERSION = "0.1.0";

export interface LedgerEvent {
  id: string;
  caseId: string;
  ts: number;
  actor: "citizen" | "portal" | "agent";
  type: string;
  payload: unknown;
  prevHash: string;
  hash: string;
}

export function hashEvent(e: Omit<LedgerEvent, "hash">): string {
  return createHash("sha256")
    .update(`${e.prevHash}|${e.ts}|${e.actor}|${e.type}|${JSON.stringify(e.payload)}`)
    .digest("hex");
}
