# FIXER.OS — The Story, The Proof, The Submission Pack

> Everything that happened from "read everything" to "everything verified and pushed", in one file.
> Written as narrative, backed by machines. Latest commit `main @ e545513`, synced with origin.

---

## Part 1 — What this is

Everyone builds compliance copilots for citizens. Nobody audits the state back.

FIXER.OS is an accountability layer between citizens and hostile public-service portals,
built for the **Build What Moves India** hackathon (Varun Mayya × OpenAI,
deadline **Aug 28, 2026 8:00 PM IST**, video ≤ 2 min, summary < 250 words, verdicts by Sep 1).

The villain: a mock EPFO portal that replays failures documented in public complaints —
false "name mismatch" rejection → grievance form that rejects its own tracking ID →
30-day lockout. The counterparty: an agent console that anchors verified citizen facts in a
tamper-evident SHA-256 hash-chained ledger, proves the contradiction, computes the
RBI-mandated ₹100/day compensation, names the blocking office, and books a
legally-cited escalation letter. Plus four novelty primitives:
RuleGuard (mechanical pension-deadlock proof for service ∈ [9.5,10)), Rejection Wind-Tunnel
(pre-flight silent-rejection prediction), Kaun-Zimmedar traceroute (accountability by name),
and an in-flow provenance verifier (phishing-clone detection).

## Part 2 — What was broken, what got fixed (this session)

1. **Two literal placeholder bugs** rendered `{pi.dashNote}` / `{pi.simNote}` on screen in
   English — the i18n pass had left template syntax inside values. Fixed with real copy.
2. **Devanagari typo** `6-अंकीY` (stray Latin Y) in portal + i18n dictionary. Fixed.
3. **Dead keys wired:** the demo page had Hindi judge-guide keys (`j1a`–`j3c`) defined but
   never rendered; they now drive the section in both languages.
4. **Maths inconsistency:** the IRCTC SLA clock was hardcoded (11 days → ₹600) while agent
   events computed it live. Unified in `lib/traceroute.ts::traceSummary(caseId, now?)`:
   accountability names the deepest breached office, while the rupee clock follows RBI GI-4
   calendar days from the debit date (T+5, ₹100/day beyond). EPFO ₹2,600/26d unchanged and
   test-pinned.
5. **Real PII-shape leak found by a new wire-level test:** the claim tracking ID
   (`PF/2026/A/0091847`) passed through free text to the model payload (only key-blocklist
   had covered it). `sanitizeForLLM` now redacts that shape; regression test proves the wire
   is clean (names, UAN/Aadhaar, PAN, IFSC, 16-digit accounts, 64-hex hashes, tracking IDs).
6. **Type-level regression caught early:** array-valued i18n keys widened `t()`'s return
   type and broke call sites — fixed with an explicit string contract.
8. **OTP stale-display + missing cooldown** (found by hand-testing the demo): after 3 wrong
   OTP attempts the server silently rotated the code but never told the page — the demo OTP
   on screen was stale, so every retry failed. Fixed the root cause (failure responses now
   always carry the current demo OTP) and added the missing real-world behavior: UIDAI/
   EPFO-style **2-minute OTP lockout** after 3 failures, with attempts counter, red
   countdown banner, disabled buttons, "cooldown over — press Resend" recovery, resend
   blocked during lock — bilingual, unit-tested, smoke-tested (34/34). Config centralized
   in `APP_CONFIG.otp`.

## Part 3 — The proof wall (all machine-verified)

- **Unit tests: 12/12** — hash-chain tamper detection at the exact event, RuleGuard proof
  ≥5 steps, full portal FSM replay, EPFO 26d/₹2,600 accrual, IRCTC T+5 boundary behavior
  (day-5 = ₹0 owed, day-10 = ₹500 owed), PII wire-safety, allow-list rejection of rogue
  model output, en↔hi dictionary parity, array-length parity, critical-string presence.
- **E2E smoke: 31/31** (`npm run smoke`, zero dependencies) — boots the real production
  server and walks: 5 pages + security headers; the complete villain journey to 30-day
  lockout; the 5-step agent loop to RESOLVED with a valid hash chain; both SLA clocks;
  RuleGuard; wind-tunnel WARN for the pension zone; provenance OFFICIAL vs phishing-clone
  tiers chained into the ledger; and docs-vs-code consistency (README routes live, log
  freshness, no live-gov endpoints).
- **Types:** `npx tsc --noEmit` clean. **Build:** 16 routes, production bundle green.
- **Word counts measured, not estimated:** submission summary 222/250 words;
  video spoken script 234 words (≈ 88–94 s at 150 wpm).

## Part 4 — The 250-word submission summary (222 words, copy-paste)

Everyone builds compliance copilots for citizens. Nobody audits the state back.

FIXER.OS is the accountability layer between citizens and hostile public-service portals,
prototyped on EPFO's most documented failure: a PF advance rejected for a "name mismatch"
that never existed, a grievance form that rejects its own tracking ID, then a 30-day
lockout. We rebuilt that portal faithfully as a mock; FIXER.OS is the counterparty, not
another assistant.

It anchors the citizen's verified facts in a tamper-evident SHA-256 hash-chained ledger and
proves the state's rejection contradicts its own records. An OpenAI-compatible model picks
each step strictly from a five-action allow-list; every name, ID and identifier is
scrubbed before any model call — proven by wire-level tests — and execution stays
deterministic.

Three primitives make it a platform: a Rejection Wind-Tunnel predicting silent rejections
before filing; RuleGuard, which mathematically proves no pension outcome exists for service
in [9.5,10) years and emits a developer-ready bug report; and Kaun-Zimmedar traceroute
naming the blocking office with days-over statutory deadlines while the RBI-mandated
₹100/day compensation clock accrues live. An in-flow origin verifier catches phishing
clones.

The engine already runs a second vertical: RBI TAT payment recovery. Ledger, proofs,
playbook engine and bilingual Hindi/English interface are real today; the portal, facts
and outcomes are clearly-labeled mocks. Safer-by-design scale path: Postgres adapter and
DigiLocker-authenticated ingestion. Ownership, not another form.

## Part 5 — The 2-minute video transcript (234 spoken words)

**[0:00–0:08] Landing hero.**
"Seven crore Indians trust EPFO with their retirement money. When claims fail, the
rejection is often false — and nobody audits the state back. This is FIXER.OS."

**[0:08–1:00] /portal — the villain.**
Clicks: banner creds (UAN 100000000000 / demo1234) → captcha → Verify → OTP inline →
dashboard → Form-31 → submit → "Check Again Tomorrow" ×2 (narrate the rest) → REJECTED →
scroll the comparison table → grievance → invalid tracking ID → 30-day lockout.
Say: "Watch the documented reality. Member login, OTP, dashboard. I file a
fifty-thousand-rupee medical advance. Day one — under process. Day seven — rejected, name
mismatch. But the portal's own table shows both names IDENTICAL. I file a grievance — it
rejects its own tracking ID. Then: next grievance allowed in thirty days. Citizen dead-end."

**[1:00–1:35] /fixer — the counterparty.**
Clicks: "Run next agent step" ×5; point in order: green "Hash chain verified" → ₹2,600 SLA
clock → red Regional Office node → Download letter → RESOLVED chip.
Say: "Now the counterparty. Step one proves the contradiction against the hash chain —
verified live. Two drafts the rebuttal. Three records the closure gap. Four — twenty-six
hundred rupees owed, a hundred per day, RBI law. Five names the Regional PF Commissioner,
twenty-six days overdue, letter downloaded. Case resolved."

**[1:35–1:50] Killer moments.**
Flash RuleGuard card, then the Hindi toggle.
Say: "RuleGuard proves mathematically no pension outcome exists between nine-and-a-half and
ten years of service — with the exact developer fix. And this toggle — full Hindi."

**[1:50–2:00] Honesty frame** (hold on the Real/Mock card).
Say: "Codex scaffolded the core; an OpenAI-compatible model picks only from five
allow-listed actions; personal data is scrubbed before any call — tested at the wire. Real:
ledger, proofs, playbooks. Honestly mocked: the portal. Same engine runs an RBI payment
case. FIXER.OS — the ownership layer India skipped."

## Part 6 — Recording drill

1. `npm run build && npm start` **locally** — not Vercel (serverless resets in-memory state
   per instance; your take must be clean).
2. Fresh incognito, 100% zoom, devtools hidden.
3. Two dry rehearsals of the click path, then record twice, keep the better cut.
4. Runtime must stay ≤ 2:00 — speech is ~90 s, ~30 s of breathing room for clicks.

## Part 7 — Scorecard vs the official brief

| Brief requirement | State | Evidence |
|---|---|---|
| Codex / OpenAI meaningfully involved | Met, one caveat | CODEX_LOG phases 0–1 credit Codex (commit refs); llm.ts allow-list AI picks. Add any free LLM key to Vercel so the LLM-DECIDED badge fires live; without it, deterministic fallback runs everything. |
| One clearly defined problem | Met | EPFO false rejection labeled in-console; IRCTC labeled generality proof. |
| Complete journey start→finish | Met, machine-proven | Smoke 31/31 walks the full chain. |
| Easier than current experience | Met | One-click dashboard vs buried passbook; 5-click resolution vs lockout. |
| Mobile / slow / limited-digital users | Met except offline | System fonts, ~103 kB first load, responsive, Hindi parity-tested, reduced-motion, font scaling. |
| Mock/synthetic wherever sensitive | Met | Seeds only; OTP server-session only; wire-level PII proof. |
| Strong-build six questions | 5 in-product + 1 spoken | "Scales safely" must be said in video / written in summary (it is). |
| Judging lenses | 9–10/10 each (self-scored, evidence-backed) | Problem citations dated; working build proven twice; honesty is the differentiator. |

## Part 8 — What remains (complete list)

1. **Record the video** (script above, drill above) — the single highest-leverage hour left.
2. **Paste the 222-word summary** into the form.
3. Optional: free Groq/Gemini/OpenAI key into Vercel env + `.env.local` for the live badge.
4. Solo submission → partner email blank. Same registered email at every step.
5. Submit before **Aug 28, 2026, 8:00 PM IST** — no grace period.

The state digitized forms, never accountability. We shipped the missing primitive:
ownership — audited, translated, and provably clean.
