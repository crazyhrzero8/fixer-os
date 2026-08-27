# Walkthrough — MongoDB Integration, Fallback LLM, Bilingual Parity, UI Cleanup, & Build Resolution

This walkthrough summarizes the technical changes made to implement persistent MongoDB storage, configure the OpenAI API key fallback to Groq, establish complete Hindi translation parity (including dynamically switching select dropdown options), simplify UI layouts, and resolve Next.js directory resolution compilation warnings.

---

## 1. Technical Changes

### Database Integration & Persistent Store
*   **Added Dependency:** Installed the official `mongodb` driver.
*   **MongoDB Client Helper ([`lib/mongodb.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/mongodb.ts)):** Configured a client manager that caches connection promises, optimized for Next.js hot-reloaded development environments.
*   **Storage Refactoring ([`lib/store.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/store.ts)):**
    *   Transitioned the `CaseStore` interface from synchronous method signatures to asynchronous Promise signatures.
    *   Updated the in-memory `MemoryStore` to operate asynchronously.
    *   Implemented the new `MongoStore` class to query and persist cases directly in the MongoDB `cases` collection when a `MONGODB_URI` environment variable is defined.
    *   Implemented **Lazy Seeding**: To avoid runtime circular dependencies between store interfaces and seeded mock events, a seed registration callback helper was introduced. The mock cases are seeded dynamically in both storage engines upon first list/get query if the collections are empty.

### Async Refactoring across Modules
*   **Ledger Updates ([`lib/ledger.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/ledger.ts)):** Made case resolution, modification, and event-appending methods asynchronous.
*   **Preflight Updates ([`lib/preflight.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/preflight.ts)):** Updated `runPreflight` to be async to support the `getCase` query.
*   **Provenance Updates ([`lib/provenance.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/provenance.ts)):** Updated `verifyOrigin` to be async to support the ledger event-appending operations.
*   **Agent Updates ([`lib/agent.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/../lib/agent.ts)):** Refactored `nextAgentStep` to await store and ledger calls.

### API Routes Refactor
Modified the Next.js App Router route handlers to await store and ledger Promise completions:
*   [`app/api/cases/route.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/api/cases/route.ts)
*   [`app/api/case/[id]/route.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/api/case/%5Bid%5D/route.ts)
*   [`app/api/agent/step/route.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/api/agent/step/route.ts)
*   [`app/api/preflight/route.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/api/preflight/route.ts)
*   [`app/api/provenance/route.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/api/provenance/route.ts)

### OpenAI-to-Groq LLM Fallback ([`lib/llm.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/llm.ts))
*   **Model Configuration Overrides:** Support was added for explicit model parameters (`OPENAI_MODEL`, `GROQ_MODEL`, `GEMINI_MODEL`) in addition to the generic fallback `LLM_MODEL`.
*   **Dynamic Runtime Fallback:** If `decideNextAction` fails when calling the primary OpenAI API (due to quota breach, server error, invalid credentials, or network errors), the engine automatically catches the error, logs a warning, and sequences down to the next configured provider (e.g., Groq) before degrading to deterministic local workarounds.

### Bilingual (Hindi) Translation Parity
*   **Case Select Dropdown Options:** Modified the options mapping loop in [`app/fixer/page.tsx`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/fixer/page.tsx) to pass the raw case titles through `translateTitle(lang, c.title)`. When switching to Hindi, select dropdown options (e.g., "PF advance false rejection") now translate dynamically to Hindi.
*   **RuleGuard Mathematical Proofs:** Modified [`lib/prover.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/prover.ts) to accept a language parameter and returned translated steps and suggested route-arounds. Added language forwarding in the pension proof API handler ([`app/api/prove/pension/route.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/api/prove/pension/route.ts)).
*   **Timeline and Last Agent Action:** Created a reactive translation mapper `translateEvent` in [`lib/i18n.tsx`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/i18n.tsx) that dynamically converts step titles, descriptions, and actor events into Hindi.
*   **Preflight Warnings & Fixes:** Configured a translation lookup map (`translatePreflight`) for preflight checks and recommendations, displaying localized messages for bank IFSC mergers, missing nominations, name mismatches, and pension deadlock intervals.
*   **Traceroute Departments & SLA Nodes:** Mapped administrative designations, statutory timeline warnings, and offices to Hindi (`translateTraceNode` & `translateTraceNodeRule`).

### UI Layout Simplification & Footnote Cleanup
Pruned developer-centric, text-heavy disclaimers and checklists to clean up the layouts:
*   **Landing Page ([`app/page.tsx`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/page.tsx)):** Removed the "Latest Updates" build log strip, the "Roadmap" cards, the static evidence grid (UPI and RBI statistics cards), and the duplicate "Evaluate like a judge" credentials box at the bottom. The landing page now displays only the hero description and direct navigation links to portal modules.
*   **GovShell ([`app/govshell.tsx`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/govshell.tsx)):** Replaced the massive 4-column footer containing dozens of documentation, legal, and research links with a clean, single-row footer bar containing the essential copyright, simulated warning, and Terms/Demo shortcuts.
*   **Simulated Portal ([`app/portal/page.tsx`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/portal/page.tsx)):** Removed confusing technical disclosures and developer disclaimers (`otpDbNote` from the OTP card, `dashNote` from the dashboard, `claimDb` from the claim form, and the giant `safetyBody` footnote container from the bottom of the page).
*   **Agent Console ([`app/fixer/page.tsx`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/fixer/page.tsx)):** Deleted the verbose "What is real in this prototype? (Honesty disclosure)" checklist card from the right sidebar, as well as developer footnote descriptions under the preflight checks (`wtFoot`) and timeline history (`tlDesc`). Simplified Console subheadings to present direct, easy-to-read audit scopes.
*   **Demo Theater ([`app/demo/page.tsx`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/demo/page.tsx)):** Deleted the "The novelty is..." text block and streamlined the "What judges test" guide into a clean, compact notice alert block.

### Onboarding Walkthrough Bot with Two-Way State Synchronization
*   **Visual Highlights & Guidance ([`components/NavBot.tsx`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/components/NavBot.tsx)):** Implemented a floating bot assistant that overlays a pulsing, glowing red outline ring around target elements that require action.
*   **State Auto-Sync:** Built a two-way synchronization engine (`getPortalStepFromDOM` and `getFixerStepFromDOM`) that continuously scans the active DOM structure and page path. If the user completes steps out-of-order, triggers actions directly in the UI, or reloads a partially completed page, the bot automatically fast-forwards or syncs its active guide card to match the user's correct step state.

### Next.js Build Resolve Config
*   **Next Config Update ([`next.config.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/next.config.ts)):** Set `outputFileTracingRoot` configuration to `process.cwd()` to prevent Webpack/Next.js dynamic builds from climbing up to parent folders (`C:\Users\paliw\package-lock.json`) when inferring workspace roots.

---

## 2. Verification Results

### Automated Unit Tests
Executed `npm run test` against the unit tests, confirming that mock data validation, engine logic, and Hindi localization key parity are correct:
```text
✔ provider resolves from env and targets OpenAI-compatible endpoint (3.2964ms)
✔ outbound LLM request is PII-free end to end (DPDP data-minimisation proof) (80.8454ms)
...
ℹ tests 13
ℹ pass 13
ℹ fail 0
ℹ duration_ms 1926.3723
```

### E2E Smoke Tests
Ran `npm run smoke` against the active server, verifying all user journeys and pages function correctly after cleanup:
```text
PAGES
  ✓ / 200 + marker
  ✓ /portal 200 + marker
  ✓ /fixer 200 + marker
  ✓ /demo 200 + marker
  ✓ /terms 200 + marker
  ✓ security headers present
PORTAL VILLAIN JOURNEY (documented failure replay)
  ...
SMOKE: 34/34 PASS
```
All **34/34 smoke assertions passed successfully**.
