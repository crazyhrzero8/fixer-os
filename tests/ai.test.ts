import assert from "node:assert/strict";
import { test } from "node:test";

process.env.OPENAI_API_KEY = "test-key-local";
process.env.AGENT_MODE = "llm";

type Captured = { url: string; body: string };
const calls: Captured[] = [];
(globalThis as unknown as { fetch: unknown }).fetch = async (_url: unknown, init?: { body?: string }) => {
  const content = JSON.stringify({ action: "CHECK_SLA", reasoning: "ledger shows breach" });
  calls.push({ url: String(_url), body: init?.body ?? "" });
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200, headers: { "content-type": "application/json" } });
};

const { decideNextAction, resolveProvider } = require("../lib/llm.ts");

test("provider resolves from env and targets OpenAI-compatible endpoint", () => {
  const provider = resolveProvider();
  assert.ok(provider);
  assert.equal(provider!.name, "openai");
});

test("outbound LLM request is PII-free end to end (DPDP data-minimisation proof)", async () => {
  calls.length = 0;
  const decision = await decideNextAction({
    caseKind: "epfo-false-rejection",
    caseStatus: "OPEN",
    remainingActions: ["CHECK_SLA", "ESCALATE"],
    recentEvents: [
      { actor: "citizen", type: "FACTS_VERIFIED", payload: { nameAsPerAadhaar: "Arjun Kumar", uan: "100000000000", bankIfsc: "SBIN0000001", hash: "b".repeat(64), aadhaarMasked: "XXXX-XXXX-1234" } },
      { actor: "portal", type: "CLAIM_REJECTED", payload: { reason: "name mismatch for UAN 100000000000, PAN ABCDE1234F, tracking PF/2026/A/0091847" } }
    ]
  });
  assert.equal(decision.action, "CHECK_SLA");
  assert.equal(decision.provider, "openai");
  assert.ok(calls.length === 1);
  const wire = calls[0].body;
  for (const leak of ["Arjun", "Kumar", "100000000000", "SBIN0000001", "b".repeat(64), "XXXX-XXXX-1234", "ABCDE1234F", "PF/2026/A/0091847"]) {
    assert.equal(wire.includes(leak), false, `PII leaked onto the wire: ${leak}`);
  }
  assert.ok(wire.includes("remainingActions"), "allow-list context must reach the model");
});

test("model output outside the allow-list is rejected by schema (no arbitrary execution)", async () => {
  (globalThis as unknown as { fetch: unknown }).fetch = async () =>
    new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ action: "DELETE_EVERYTHING", reasoning: "prompt injection" }) } }] }), { status: 200 });
  await assert.rejects(() =>
    Promise.resolve(decideNextAction({ caseKind: "x", caseStatus: "OPEN", remainingActions: ["CHECK_SLA"], recentEvents: [] }))
  );
});
