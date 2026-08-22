import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { test } from "node:test";

process.env.OPENAI_API_KEY = "";

const { verifyLedger } = require("../lib/ledger.ts");
const { provePensionDeadlock } = require("../lib/prover.ts");
const { initialPortalSnapshot, transitionPortal, PORTAL_STATES, PROCESSING_DAYS } = require("../lib/portalFsm.ts");
const { traceSummary, escalationLetter } = require("../lib/traceroute.ts");

test("ledger detects tampering at the exact event", () => {
  const seeded = { id: "c1", kind: "epfo-false-rejection", title: "t", status: "OPEN", facts: {}, events: [] };
  const mk = (n: number, prev: string) => ({ id: `evt-${n}`, caseId: "c1", ts: n, actor: "portal", type: `T${n}`, payload: { n }, prevHash: prev, hash: "" });
  const e1 = { ...mk(1, "0".repeat(64)), hash: "" };
  e1.hash = createHash("sha256").update(`${e1.prevHash}|${e1.ts}|${e1.actor}|${e1.type}|${JSON.stringify(e1.payload)}`).digest("hex");
  const e2 = { ...mk(2, e1.hash), hash: "" };
  e2.hash = createHash("sha256").update(`${e2.prevHash}|${e2.ts}|${e2.actor}|${e2.type}|${JSON.stringify(e2.payload)}`).digest("hex");
  const clean = { ...seeded, events: [e1, e2] };
  assert.equal(verifyLedger(clean).valid, true);
  const tampered = { ...clean, events: [{ ...e1, payload: { n: 999 } }, e2] };
  const result = verifyLedger(tampered);
  assert.equal(result.valid, false);
  assert.equal(result.brokenAt, e1.id);
});

test("prover proves the pension interval deadlock", () => {
  const proof = provePensionDeadlock();
  assert.equal(proof.contradiction, true);
  assert.ok(proof.proofSteps.length >= 5);
});

test("portal FSM replays the documented failure sequence", () => {
  let snap = initialPortalSnapshot();
  assert.equal(snap.state, PORTAL_STATES.LOGIN_FRICTION);
  // Captcha refresh stays in same state with new random challenge (crypto.randomBytes)
  snap = transitionPortal(snap, "REFRESH_CAPTCHA");
  assert.equal(snap.state, PORTAL_STATES.LOGIN_FRICTION);
  snap = transitionPortal(snap, "VERIFY_CAPTCHA");
  assert.equal(snap.state, PORTAL_STATES.OTP_REQUIRED);
  // OTP resend stays in OTP_REQUIRED
  snap = transitionPortal(snap, "RESEND_OTP");
  assert.equal(snap.state, PORTAL_STATES.OTP_REQUIRED);
  snap = transitionPortal(snap, "VERIFY_OTP");
  assert.equal(snap.state, PORTAL_STATES.CLAIM_FORM);
  snap = transitionPortal(snap, "SUBMIT_ADVANCE_CLAIM");
  assert.equal(snap.state, PORTAL_STATES.UNDER_PROCESS);
  for (let i = 0; i < PROCESSING_DAYS; i++) snap = transitionPortal(snap, "ADVANCE_DAY");
  assert.equal(snap.state, PORTAL_STATES.REJECTED);
  snap = transitionPortal(snap, "OPEN_GRIEVANCE");
  snap = transitionPortal(snap, "SUBMIT_GRIEVANCE");
  assert.equal(snap.state, PORTAL_STATES.GRIEVANCE_INVALID_TRACKING);
  snap = transitionPortal(snap, "OPEN_GRIEVANCE");
  assert.equal(snap.state, PORTAL_STATES.GRIEVANCE_LOCKED_OUT);
  snap = transitionPortal(snap, "RESET");
  assert.equal(snap.state, PORTAL_STATES.LOGIN_FRICTION);
});

test("traceroute computes overdue days and rupee accrual for both cases", () => {
  const epfo = traceSummary("synthetic-epfo-001");
  assert.equal(epfo.blocker.id, "regional");
  assert.equal(epfo.daysOverdue, 26);
  assert.equal(epfo.tatCompensationAccrued, 2600);
  assert.match(escalationLetter("synthetic-irctc-001"), /RBI/);
});
