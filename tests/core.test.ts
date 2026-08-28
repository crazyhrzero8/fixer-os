import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { test } from "node:test";

process.env.OPENAI_API_KEY = "";

const { verifyLedger, signEventPayload, hashEvent } = require("../lib/ledger.ts");
const { provePensionDeadlock } = require("../lib/prover.ts");
const { initialPortalSnapshot, transitionPortal, PORTAL_STATES, PROCESSING_DAYS } = require("../lib/portalFsm.ts");
const { traceSummary, escalationLetter } = require("../lib/traceroute.ts");
const { sanitizeForLLM } = require("../lib/llm.ts");

test("ledger detects tampering at the exact event", () => {
  const seeded = { id: "c1", kind: "epfo-false-rejection", title: "t", status: "OPEN", facts: {}, events: [] };
  const mk = (n: number, prev: string) => {
    const actor = "portal";
    const type = `T${n}`;
    const payload = { n };
    const ts = n;
    const signature = signEventPayload(actor, prev, ts, type, payload);
    return { id: `evt-${n}`, caseId: "c1", ts, actor, type, payload, prevHash: prev, signature, hash: "" };
  };
  const e1 = { ...mk(1, "0".repeat(64)), hash: "" };
  e1.hash = hashEvent(e1);
  const e2 = { ...mk(2, e1.hash), hash: "" };
  e2.hash = hashEvent(e2);
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
  assert.equal(snap.state, PORTAL_STATES.DASHBOARD);
  snap = transitionPortal(snap, "VIEW_PASSBOOK");
  assert.equal(snap.state, PORTAL_STATES.DASHBOARD);
  snap = transitionPortal(snap, "OPEN_CLAIM_FORM");
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

test("IRCTC TAT clock ticks dynamically per RBI calendar-day rule (T+5, ₹100/day beyond)", () => {
  const debit = "2026-08-10T10:04:00+05:30";
  const atDay5 = traceSummary("synthetic-irctc-001", Date.parse("2026-08-15T10:04:00+05:30"));
  assert.equal(atDay5.daysOverdue, 0, "T+5 not yet breached on day 5 (GI-4: T = calendar date)");
  assert.equal(atDay5.tatCompensationAccrued, 0);
  const atDay10 = traceSummary("synthetic-irctc-001", new Date(new Date(debit).getTime() + 10 * 86_400_000).getTime());
  const gateway = atDay10.nodes.find((n: { id: string }) => n.id === "gateway");
  assert.equal(gateway?.daysHeld, 10);
  assert.equal(gateway?.breached, true);
  assert.equal(atDay10.blocker.id, "irctc-refunds", "accountability names the deepest breached office");
  assert.equal(atDay10.daysOverdue, 5, "rupee clock follows RBI T+5 from debit date");
  assert.equal(atDay10.tatCompensationAccrued, 500);
});

test("LLM payload is PII-sanitized before leaving the server", () => {
  const dirty = {
    caseKind: "epfo-false-rejection",
    remainingActions: ["CHECK_SLA"],
    caseStatus: "OPEN",
    recentLedgerEvents: [
      { actor: "citizen", type: "FACTS_VERIFIED", payload: { nameAsPerAadhaar: "Arjun Kumar", uan: "100000000000", bankIfsc: "SBIN0000001", hash: "a".repeat(64) } },
      { actor: "portal", type: "CLAIM_REJECTED", payload: { reason: "name mismatch for 100000000000" } }
    ]
  };
  const clean = sanitizeForLLM(dirty);
  const s = JSON.stringify(clean);
  assert.equal(s.includes("Arjun"), false, "person name leaked");
  assert.equal(s.includes("100000000000"), false, "UAN leaked");
  assert.equal(s.includes("SBIN0000001"), false, "IFSC leaked");
  assert.equal(s.includes("a".repeat(64)), false, "hash leaked");
  assert.ok(s.includes("[REDACTED]") || s.includes("UAN_REDACTED") || s.includes("IFSC_REDACTED"), "redaction markers present");
});

test("OTP lockout: 3 wrong attempts trigger 2-minute cooldown; verify+resend blocked during lock", () => {
  const { applyAction, getCaptcha, otpStatus } = require("../lib/portalSessions.ts");
  const sid = `otp-lock-${Date.now()}`;
  const captcha = getCaptcha(sid);
  const afterCaptcha = applyAction(sid, "VERIFY_CAPTCHA", JSON.stringify({ captcha, uan: "100000000000", password: "demo1234" }));
  assert.equal(afterCaptcha.state, "OTP_REQUIRED");
  assert.equal(otpStatus(sid).attemptsLeft, 3);
  for (let i = 0; i < 3; i++) applyAction(sid, "VERIFY_OTP", "000000x");
  const locked = otpStatus(sid);
  assert.ok(locked.lockedSeconds > 100 && locked.lockedSeconds <= 120, `locked ${locked.lockedSeconds}s`);
  assert.equal(locked.attemptsLeft, 3, "attempt counter resets with fresh OTP");
  applyAction(sid, "VERIFY_OTP", "111111");
  applyAction(sid, "RESEND_OTP");
  const still = otpStatus(sid);
  assert.ok(still.lockedSeconds > 0, "lock persists — no immediate retry");
  assert.ok(still.expiresInSeconds <= locked.expiresInSeconds + 1, "no new OTP minted during cooldown");
});

test("regression: preflight engine evaluates boolean literals and sanitizeForLLM scrubs dynamic names", () => {
  const { evaluateRule } = require("../lib/rules.ts");
  const rule = {
    id: "test-bool",
    test: { op: "eq", left: "{{facts.ticketIssued}}", right: true },
    failStatus: "FAIL" as const,
    message: "ticket not issued"
  };
  const ctxTrue = { facts: { ticketIssued: true } };
  const ctxFalse = { facts: { ticketIssued: false } };
  assert.equal(evaluateRule(rule, ctxTrue).status, "PASS");
  assert.equal(evaluateRule(rule, ctxFalse).status, "FAIL");

  const dirty = {
    recentLedgerEvents: [
      { actor: "citizen", type: "FACTS_VERIFIED", payload: { nameAsPerAadhaar: "Radhika Sharma", displayName: "Ramu Prasad" } }
    ]
  };
  const clean = sanitizeForLLM(dirty);
  const s = JSON.stringify(clean);
  assert.equal(s.includes("Radhika"), false, "dynamic name Radhika leaked");
  assert.equal(s.includes("Sharma"), false, "dynamic name Sharma leaked");
  assert.equal(s.includes("Ramu"), false, "dynamic name Ramu leaked");
  assert.equal(s.includes("Prasad"), false, "dynamic name Prasad leaked");
});
