# CODEX_LOG.md — Build Contribution Log

Hackathon rule: Codex must be meaningfully involved in the build. This log records who did
what, phase by phase.

## Phase 0 — Repository scaffold (Aug 21, 2026)

- Prepared by: opencode assistant (ox-alpha), acting as architect per the division of labor.
- Created: Next.js 15 + TypeScript + Tailwind v4 skeleton; landing page; placeholder routes
  `/portal`, `/fixer`, `/demo`; stub modules `lib/{ledger,schemas,prover,llm}.ts`; playbook
  JSON stubs; synthetic seed data; security headers in `next.config.ts`; `.gitignore` covering
  `.env*`.
- No business logic implemented yet, by design.

## Phase 1 — Mock EPFO villain (Aug 21, 2026)

- Implemented by: Codex.
- Built `/portal` as a synthetic, deliberately hostile Member e-Sewa-style workflow: captcha
  friction, PF advance submission, seven simulated days in `Under Process`, a false name-mismatch
  rejection, an `Invalid tracking ID` grievance failure, and a 30-day grievance lockout.
- Added `POST /api/portal/action` and the exported finite-state-machine contract in
  `lib/portalFsm.ts`, so future modules can read and replay the same states. The rejection screen
  cross-checks the two matching synthetic seed names directly; no live systems or real identity
  data are used.

## Phase 2 — Hash-chained ledger (Aug 21, 2026)

- Implemented a seeded synthetic case with append-only SHA-256 event chaining, ledger verification,
  reset/replay support, and `GET /api/case/:id`. The console displays each hash so the evidence
  trail is inspectable rather than a visual-only claim.

## Phase 3 — Playbooks + agent loop (Aug 21, 2026)

- Activated provenance-noted playbooks and added a deterministic, allow-listed agent loop at
  `POST /api/agent/step`. It proves the matching-name contradiction, creates a rebuttal,
  records the grievance closure gap, calculates SLA impact, and routes an escalation while
  appending every action to the ledger. This demo path deliberately needs no API key.

### Phase 3b — LLM action-selection layer (Aug 21, 2026)

- Implemented by: opencode assistant (ox-alpha). Reason: contributor's Codex quota was
  exhausted mid-build; Codex had delivered Phases 0–1 and the WIP architecture in commits
  `8e3f558` and `3e887a9`.
- Added `lib/llm.ts`: OpenAI gpt-4o-mini via fetch (zero new dependencies), JSON-mode output,
  10s abort timeout, strict zod validation of `{action, reasoning}`.
- Portal state and ledger events are passed to the model as untrusted data behind an
  anti-injection system prompt; the model may only PICK an action from the remaining
  allow-listed set — execution stays deterministic.
- Every LLM decision is appended to the ledger as an `LLM_DECISION` event; any API or schema
  failure silently falls back to the deterministic path; the console shows an
  LLM-DECIDED / DETERMINISTIC FALLBACK badge per step. Without `OPENAI_API_KEY` the demo
  still runs end-to-end.

## Phase 4 — RuleGuard proof integration (Aug 21, 2026)

- Exposed the interval-constraint pension deadlock proof through `GET /api/prove/pension` and
  rendered its proof steps, route-around, and developer-ready bug report in the agent console.

## Phase 4.5 — Kaun Zimmedar traceroute (Aug 21, 2026)

- Added an accountable-route model and `GET /api/traceroute`: Member Portal → Field Office →
  Regional Office → CPC. The trace marks breached nodes, identifies the Regional Office blocker,
  calculates a synthetic ₹100/day SLA clock, and produces a pre-addressed escalation draft.

## Phase 5 — Split-screen demo theater (Aug 21, 2026)

- Built `/demo` as an auto-run comparison: one synthetic citizen remains stuck in the portal loop,
  while the other follows the evidence/agent path to a routed resolution packet. It has replay and
  pause controls for a live demo.

## Phase 6 — Polish + submission assets (Aug 21, 2026)

- Replaced the placeholder console and demo with cohesive dark, high-contrast presentation views;
  added honest real-versus-mocked disclosures and preserved all synthetic-data constraints.
