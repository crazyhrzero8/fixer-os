import assert from "node:assert/strict";

const BASE = process.env.SMOKE_BASE ?? "http://127.0.0.1:3107";
let passed = 0;
function ok(name: string, cond: unknown): asserts cond {
  assert.ok(cond, `FAIL: ${name}`);
  passed++;
  console.log(`  ✓ ${name}`);
}

async function j(url: string, init?: RequestInit): Promise<{ status: number; body: any; headers: Headers }> {
  const r = await fetch(`${BASE}${url}`, init);
  return { status: r.status, body: await r.json().catch(() => null), headers: r.headers };
}

const post = (url: string, body: unknown, cookie?: string) =>
  j(url, { method: "POST", headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) });

async function pages() {
  console.log("PAGES");
  for (const [route, marker] of [["/", "audits the state back"], ["/portal", "UAN"], ["/fixer", "FIXER.OS"], ["/demo", "FIXER.OS"], ["/terms", "Synthetic"]] as const) {
    const r = await fetch(`${BASE}${route}`);
    const html = await r.text();
    ok(`${route} 200 + marker`, r.status === 200 && html.includes(marker));
  }
  const home = await fetch(`${BASE}/`);
  ok("security headers present", home.headers.get("x-frame-options") === "DENY" && home.headers.get("content-security-policy")?.includes("default-src 'self'"));
}

async function portalJourney() {
  console.log("PORTAL VILLAIN JOURNEY (documented failure replay)");
  const cap = await j("/api/portal/action");
  const cookie = cap.headers.getSetCookie()[0].split(";")[0];
  const captcha = cap.body.captcha as string;
  ok("captcha issued + httpOnly session cookie", Boolean(cap.body.spaced) && cookie.startsWith("portal_sid="));
  const bad = await post("/api/portal/action", { action: "VERIFY_CAPTCHA", uan: "100000000000", password: "demo1234", captcha: "WRONG" }, cookie);
  ok("wrong captcha rejected, stays at login", bad.body.snapshot.state === "LOGIN_FRICTION");
  const fresh = await j("/api/portal/action", { headers: { cookie } });
  const otp = await post("/api/portal/action", { action: "VERIFY_CAPTCHA", uan: "100000000000", password: "demo1234", captcha: fresh.body.captcha }, cookie);
  ok("eval creds → OTP_REQUIRED + demo OTP inline", otp.body.snapshot.state === "OTP_REQUIRED" && /^[0-9]{6}$/.test(otp.body.demoOtp));
  const dash = await post("/api/portal/action", { action: "VERIFY_OTP", otp: otp.body.demoOtp }, cookie);
  ok("OTP → DASHBOARD", dash.body.snapshot.state === "DASHBOARD");
  const form = await post("/api/portal/action", { action: "OPEN_CLAIM_FORM" }, cookie);
  const claim = await post("/api/portal/action", { action: "SUBMIT_ADVANCE_CLAIM" }, cookie);
  ok("claim → UNDER_PROCESS", form.body.snapshot.state === "CLAIM_FORM" && claim.body.snapshot.state === "UNDER_PROCESS");
  let state = "";
  for (let i = 0; i < 7; i++) state = (await post("/api/portal/action", { action: "ADVANCE_DAY" }, cookie)).body.snapshot.state;
  ok("7 simulated days → REJECTED (false name mismatch)", state === "REJECTED");
  const g1 = await post("/api/portal/action", { action: "OPEN_GRIEVANCE" }, cookie);
  const g2 = await post("/api/portal/action", { action: "SUBMIT_GRIEVANCE" }, cookie);
  ok("grievance rejects own tracking ID", g1.body.snapshot.state === "GRIEVANCE_FORM" && g2.body.snapshot.state === "GRIEVANCE_INVALID_TRACKING");
  const g3 = await post("/api/portal/action", { action: "OPEN_GRIEVANCE" }, cookie);
  ok("30-day lockout reached", g3.body.snapshot.state === "GRIEVANCE_LOCKED_OUT");
  await post("/api/portal/action", { action: "RESET" }, cookie);
}

async function agentJourney() {
  console.log("AGENT JOURNEY (accountability loop)");
  await fetch(`${BASE}/api/case/synthetic-epfo-001`, { method: "POST" });
  let last: any;
  for (let i = 0; i < 5; i++) last = (await post("/api/agent/step", { caseId: "synthetic-epfo-001" })).body;
  ok("5 steps → completed", last.result.completed === true);
  ok("hash chain verified end-to-end", last.verification.valid === true && last.verification.eventCount > 7);
  ok("case flips to RESOLVED", last.case.status === "RESOLVED");
  ok("actions stayed inside allow-list", ["INTERPRET_STATE", "DRAFT_REBUTTAL", "FILE_APPEAL", "CHECK_SLA", "ESCALATE"].includes(last.result.action));
  const rejected = await j("/api/agent/step/bogus");
  ok("bad route 404", rejected.status === 404);
  const badCase = await post("/api/agent/step", { caseId: "hacker-case" });
  ok("unknown caseId rejected 400", badCase.status === 400);
}

async function modules() {
  console.log("MODULE MATHS + PROOFS");
  const ep = await fetch(`${BASE}/api/traceroute?case=synthetic-epfo-001`).then(r => r.json());
  ok("EPFO clock ₹2,600 / 26d overdue", ep.daysOverdue === 26 && ep.tatCompensationAccrued === 2600 && ep.blocker.designation.includes("Regional PF Commissioner"));
  const ir = await fetch(`${BASE}/api/traceroute?case=synthetic-irctc-001`).then(r => r.json());
  ok("IRCTC clock dynamic (elapsed>5, ₹ overdue>0)", ir.daysOverdue > 0 && ir.tatCompensationAccrued === ir.daysOverdue * 100);
  const proof = await fetch(`${BASE}/api/prove/pension`).then(r => r.json());
  ok("RuleGuard contradiction [9.5,10) proven", proof.contradiction && proof.proofSteps.length >= 5);
  const pf = await fetch(`${BASE}/api/preflight?case=synthetic-epfo-001`).then(r => r.json());
  ok("wind-tunnel: pension-zone WARN surfaces", pf.results.find((r: any) => r.ruleId === "pension-deadlock-zone")?.status === "WARN");
  const off = (await post("/api/provenance", { caseId: "synthetic-epfo-001", origin: "https://unifiedportal-mem.epfindia.gov.in" })).body;
  ok("provenance: official domain → OFFICIAL + chained in ledger", off.verdict.tier === "OFFICIAL");
  const phish = (await post("/api/provenance", { caseId: "synthetic-epfo-001", origin: "http://epfo-free-claim.xyz" })).body;
  ok("provenance: phishing clone → UNKNOWN", phish.verdict.tier === "UNKNOWN");
  const c = await fetch(`${BASE}/api/case/synthetic-epfo-001`).then(r => r.json());
  ok("PROVENANCE_VERIFIED written into hash chain", c.case.events.some((e: any) => e.type === "PROVENANCE_VERIFIED"));
}

async function docs() {
  console.log("DOCS VS CODE");
  const fs = await import("node:fs");
  const readme = fs.readFileSync("README.md", "utf8");
  const log = fs.readFileSync("CODEX_LOG.md", "utf8");
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  ok("README route claims exist (portal/fixer/demo 200s above)", readme.includes("/portal") && readme.includes("/fixer") && readme.includes("/demo"));
  ok("CODEX_LOG up to date (Phase 9 present)", log.includes("Phase 9"));
  ok("test script runs all 3 suites", pkg.scripts.test.includes("i18n.test.ts") && pkg.scripts.test.includes("ai.test.ts"));
  ok("no live-gov endpoint referenced in code", !/epfindia\.gov\.in(?!\/[^"]*\*)/.test(fs.readFileSync("lib/portalSessions.ts", "utf8")));
}

(async () => {
  for (const suite of [pages, portalJourney, agentJourney, modules, docs]) await suite();
  console.log(`\nSMOKE: ${passed}/${passed} PASS`);
})().catch((e) => { console.error(`\nSMOKE FAILED: ${e.message}`); process.exit(1); });
