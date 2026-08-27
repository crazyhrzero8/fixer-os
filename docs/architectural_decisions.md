# Architectural Decisions, Video Script & Project Summary

This document details the architectural decisions taken, a 2-minute video script (split into citizen and builder sections), and the under-250-word project summary for the **Build What Moves India** hackathon prototype.

---

## 1. Architectural Decisions Document

### Philosophy: The State-Auditing Counterparty
Traditional civic-tech applications are built as **compliance copilots**: they help citizens navigate complex websites, fill forms, or understand instructions. However, if the government’s underlying portal rejects a claim arbitrarily or enters a lockout loop, the citizen remains stuck.
**FIXER.OS is built as an accountability layer.** Instead of helping the citizen submit to a broken portal, it records the portal's behavior, cross-examine it against verified citizen facts, calculates statutory delays and penalty fees, and generates court-ready escalation files.

```text
               ┌───────────────────────────────────────┐
               │         Verified Citizen Facts        │
               └───────────────────┬───────────────────┘
                                   │ (Anchored)
                                   ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Mock Portal    │────>│  SHA-256 Ledger  │<────│    RuleGuard     │
│ (Villain Events) │     │  (Audit Trail)   │     │ (Deadlock Proof) │
└──────────────────┘     └─────────┬────────┘     └──────────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │  FIXER.OS Agent  │
                         └─────────┬────────┘
                                   │ (Allow-listed action)
                                   ▼
                        ┌─────────────────────┐
                        │ Escalation Packet & │
                        │  Rupee TAT Clock    │
                        └─────────────────────┘
```

---

### Core Architectural Pillars

### 1. Tamper-Evident SHA-256 Ledger
*   **Path:** [`lib/ledger.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/ledger.ts)
*   **Decision:** Every event (citizen verification, portal submission, portal rejection, agent action, provenance checks) is appended to a local, in-memory, cryptographically linked event ledger.
*   **Rationale:** To hold the state accountable, a citizen needs a court-ready, non-repudiable timeline. If the portal claims a "name mismatch" but previously accepted identical facts, the ledger exposes the logical contradiction. The SHA-256 hash chains guarantee that the history has not been retroactively altered.

### 2. RuleGuard Formal Prover
*   **Path:** [`lib/prover.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/prover.ts)
*   **Decision:** A dedicated rule solver designed to run logical checks on unrounded eligibility parameters.
*   **Rationale:** Real-world portals frequently contain rule deadlocks. For instance, in the EPFO pension paradox, if a member has between 9.5 and 10 years of service, one sub-system blocks withdrawal (requiring < 9.5 years) while another blocks monthly pension (requiring ≥ 10 years). RuleGuard formally proves that *no outcome is reachable* for this range and emits a developer-ready bug report to resolve the implementation deadlock.

### 3. Kaun-Zimmedar Traceroute & SLA Clock
*   **Path:** [`lib/traceroute.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/traceroute.ts)
*   **Decision:** Visualizing the claim's path through administrative offices, calculating days held at each node against statutory timelines, and dynamically accruing compensation.
*   **Rationale:** Bureaucracy operates behind a veil of anonymity. The traceroute names the specific bottleneck (e.g., the Regional PF Commissioner) and highlights days overdue. The SLA clock calculates the RBI-mandated ₹100/day compensation for failed transactions (based on DPSS.CO.PD No.629/02.01.014/2019-20), turning bureaucratic delay into an active financial liability for the department.

### 4. Rejection Wind-Tunnel
*   **Path:** [`lib/preflight.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/preflight.ts)
*   **Decision:** Static, declarative JSON schemas (`playbooks/preflight-rules.json`) that evaluate a citizen's dossier *prior* to portal filing.
*   **Rationale:** Prevents "black-hole" submissions. By checking facts (like bank IFSC validity or service period) against a local rule database, the wind-tunnel flags warnings (e.g., entering the pension dead zone) before the citizen faces a portal lockout.

### 5. Hybrid Agent Logic: Allow-Listed State Decisions
*   **Path:** [`lib/agent.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/agent.ts) and [`lib/llm.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/llm.ts)
*   **Decision:** The agent uses an OpenAI-compatible model to decide on the next action, but restricts choices strictly to a five-action allow-list (`INTERPRET_STATE`, `DRAFT_REBUTTAL`, `FILE_APPEAL`, `CHECK_SLA`, `ESCALATE`). A 100% deterministic local state-machine serves as a zero-latency fallback.
*   **Rationale:** Fully autonomous LLM agents are highly susceptible to prompt injection, loops, and hallucinating regulatory clauses when exposed to untrusted portal responses. The allow-list ensures absolute determinism and reliability, while the model adds intelligent context matching.

### 6. Privacy-First PII Scrubbing
*   **Path:** [`lib/llm.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/llm.ts)
*   **Decision:** A regex-based wire-level filter (`sanitizeForLLM`) and key-blocklist that strips or redacts Aadhaar, PAN, names, tracking IDs, bank details, and hashes before they are transmitted to any external LLM endpoint.
*   **Rationale:** Complies with India's **Digital Personal Data Protection (DPDP) Act 2023** data-minimization guidelines. The model only needs structural metadata and event types to select the next action, ensuring sensitive personal information never leaves the local sandbox.

### 7. Accessibility-Centric Frontend (Tailwind v4 & Zero-Dependency i18n)
*   **Path:** [`lib/i18n.tsx`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/i18n.tsx)
*   **Decision:** Built using Next.js 15 (App Router), React 19, and Tailwind CSS v4. The localization engine operates entirely client-side without heavy translations libraries.
*   **Rationale:** Fast load times (~103 kB first load) and responsiveness are critical for citizens on low-bandwidth mobile networks. Keyboard hotkeys and 100% English-to-Hindi bilingual parity ensure the interface is accessible to citizens across diverse backgrounds.

---

## 2. Two-Minute Video Script

*   **Total Duration:** 2 minutes (120 seconds)
*   **Target Word Count:** ~240 words (spoken at a conversational 120–130 words per minute to allow for actions and visual transitions)

---

### Minute 1: The Citizen's Journey (0:00 - 1:00)

| Time | Visual on Screen | Spoken Audio Script |
|:---|:---|:---|
| **0:00 - 0:08** | **FIXER.OS Landing Page.** Show the bold headline: *"Everyone built compliance copilots for citizens. Nobody audits the state back."* | "Seven crore Indians trust EPFO with their retirement money. When claims fail, the rejection is often false—and nobody audits the state back. This is FIXER.OS." |
| **0:08 - 0:25** | **Simulated EPFO Portal (`/portal`).** Enter credentials (UAN `100000000000` / password `demo1234`), solve the captcha, input OTP, and submit a medical advance claim (Form-31) of ₹50,000. | "Watch the documented reality. As a citizen, I log into the member portal, verify with OTP, and file a fifty-thousand-rupee medical advance. Day one: under process." |
| **0:25 - 0:42** | **Simulated Portal (Advancing Time).** Click "Check Again Tomorrow" to advance 7 days. The portal shows **REJECTED** with the reason: *"Name on requested member ID and Primary UAN does not match."* | "Day seven: claim rejected for a name mismatch. But looking at the portal's own records, my Aadhaar and employer names are identical. The rejection is completely false." |
| **0:42 - 1:00** | **Portal Lockout.** Go to file a grievance; input the tracking ID. The portal claims it is an *"Invalid tracking ID"* and then locks the page: *"Next grievance allowed in 30 days."* | "I file a grievance. The portal rejects its own tracking ID, then locks me out for thirty days. A classic bureaucratic dead-end." |

---

### Minute 2: The Builder's Explanation (1:00 - 2:00)

| Time | Visual on Screen | Spoken Audio Script |
|:---|:---|:---|
| **1:00 - 1:20** | **Agent Console (`/fixer`).** Click *"Run next agent step"* repeatedly. The ledger updates live showing green *"Hash chain verified"* badges and the step list. | "Now, the accountability counterparty. Step one proves the contradiction against a local, SHA-256 hash-chained ledger. Step two drafts the rebuttal. Step three logs the closure gap." |
| **1:20 - 1:35** | **SLA Clock & Traceroute.** Point to the **SLA CLOCK** showing `₹2,600` accrued and the red node on the **Regional Office** traceroute. Click *"Download Letter"*. | "Step four calculates the penalty: twenty-six hundred rupees, accruing at a hundred rupees a day under RBI's TAT law. Step five blames the Regional Commissioner, twenty-six days overdue, and downloads this pre-addressed escalation draft." |
| **1:35 - 1:48** | **RuleGuard & Hindi Toggle.** Hover over the **RuleGuard** panel showing the interval proof, then toggle the interface to **Hindi**. | "RuleGuard mathematically proves that a citizen with nine-point-eight years of service gets trapped in a pension deadlock, and outputs a developer bug report. And the entire console toggles instantly into Hindi." |
| **1:48 - 2:00** | **Honesty Frame & Summary.** Display the *Real vs. Mock* checklist. End on the project logo. | "We built the ledger, proofs, and playbooks. We honestly mocked the EPFO interface. Our agent is safe-by-design, scrubbing all PII at the wire. FIXER.OS: the ownership layer India skipped." |

---

## 3. Project Summary (222 Words)

Everyone builds compliance copilots for citizens. Nobody audits the state back.

FIXER.OS is the accountability layer between citizens and hostile public-service portals, prototyped on EPFO’s most documented failures: a PF advance rejected for a “name mismatch” that never existed, a grievance form that rejects its own tracking ID, and a 30-day lockout. We rebuilt that portal faithfully as a mock; FIXER.OS is the auditing counterparty, not another form-filler.

It anchors the citizen's verified facts in a tamper-evident SHA-256 hash-chained ledger and proves the state's rejection contradicts its own records. An OpenAI-compatible model picks each step strictly from a five-action allow-list; every name, ID, and identifier is scrubbed before any model call—proven by wire-level tests—keeping execution deterministic and compliant with DPDP 2023 data-minimization.

Three primitives make it a platform: a Rejection Wind-Tunnel predicting silent rejections before filing; RuleGuard, which mathematically proves no pension outcome exists for service in [9.5, 10) years and emits a developer-ready bug report; and Kaun-Zimmedar traceroute naming the blocking office with days-over statutory deadlines while the RBI-mandated ₹100/day compensation clock accrues live. 

Ledger, proofs, playbook engine, and bilingual English/Hindi interface are real today; the portal and facts are mocks. Safe production path: Postgres adapter and DigiLocker-authenticated ingestion. Ownership, not another form.
