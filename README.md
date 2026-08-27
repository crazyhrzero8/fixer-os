# FIXER.OS — Citizen Rights & Public Service Accountability Workspace

**"Everyone built compliance copilots for citizens to submit forms. Nobody audits the state back."**

---

## 🏛️ What is FIXER.OS?

FIXER.OS is a web application designed to act as an independent compliance and auditing layer between citizens and legacy public-service portals. It simulates the real-world administrative failures of government platforms, logs transaction events in a tamper-proof cryptographic ledger, calculates statutory delay penalties, and compiles legally binding appeal notices using localized LLM agents.

---

## 🏗️ Technical Architecture & Directory Structure

The project is structured as a Next.js App Router application written in TypeScript:

```
├── app/
│   ├── api/
│   │   ├── agent/step/     # Dispatches LLM agent actions based on playbook criteria
│   │   ├── case/[id]/      # Retrieves and resets individual case records
│   │   ├── cases/          # Lists all seeded cases in the system
│   │   ├── portal/action/  # FSM action endpoint for the legacy portal simulation
│   │   ├── prove/pension/  # Math prover for EPFO service-years deadlock contradictions
│   │   ├── provenance/     # URL verification for phishing/cloning detection
│   │   └── traceroute/     # Computes office queues and overdue timelines
│   ├── fixer/              # Audit Workspace & Citizen Claims Dashboard (Passcode Protected)
│   ├── portal/             # Simulated legacy government portal (Villain Simulation)
│   ├── govshell.tsx        # Shell wrapping pages with standard headers & dynamic footers
│   └── page.tsx            # Selection landing page
├── components/
│   └── NavBot.tsx          # Real-time visual guide bot walkthrough layer
├── data/
│   └── seed.ts             # Seeding facts for synthetic citizen profiles
├── lib/
│   ├── agent.ts            # Playbook executor and LLM prompt builder
│   ├── ledger.ts           # Cryptographic hash-chain ledger implementation
│   ├── llm.ts              # PII-sanitized OpenAI model connector
│   ├── playbooks.ts        # Dynamic prompt template renderer
│   ├── portalFsm.ts        # Portal Finite State Machine state transition engine
│   ├── prover.ts           # Z3-like math prover for regulatory deadlock anomalies
│   └── traceroute.ts       # SLA deadline clocks and Office Queue Node timelines
├── playbooks/
│   ├── epfo-false-rejection.json  # Steps/markers for EPFO auditing flow
│   └── payment-tat-breach.json    # Steps/markers for IRCTC failed booking refunds
└── scripts/
    └── smoke.ts            # E2E integration test script (34/34 assertions)
```

---

## ⚙️ Detailed Functional Workings

### 1. Legacy Portal Simulation (Villain Flow)
*   **Path:** `/portal` (Visual UI) & [`lib/portalFsm.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/portalFsm.ts) (Backend).
*   **Mechanism:** Implemented as a strictly enforced Finite State Machine (FSM) tracking portal session states:
    $$\text{UNINITIALIZED} \rightarrow \text{LOGIN\_FRICTION} \rightarrow \text{OTP\_REQUIRED} \rightarrow \text{DASHBOARD} \rightarrow \text{CLAIM\_FORM} \rightarrow \text{UNDER\_PROCESS} \rightarrow \text{REJECTED}$$
*   **Documented Failures simulated:**
    *   *Buggy Captcha Checks:* Requires explicit validation; wrong captcha blocks transitions.
    *   *Automatic False Rejection:* When advancing 7 simulated days, the portal automatically triggers `REJECTED` state, citing "Name on member ID and Primary UAN does not match", even though citizen facts match perfectly.
    *   *Complaint Lockout:* When trying to file a grievance, the portal rejects its own claim tracking ID (`GRIEVANCE_INVALID_TRACKING`) and subsequently locks the citizen out for 30 days (`GRIEVANCE_LOCKED_OUT`).

### 2. Tamper-Proof Audit Ledger
*   **Path:** [`lib/ledger.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/ledger.ts).
*   **Mechanism:** Prevents retrospective tampering of timelines or status states by public offices. Every action (Citizen verifying facts, Portal rejecting claims, Agent filing appeals) is recorded as a `LedgerEvent` linked via SHA-256 hashes.
*   **Cryptographic Chain calculation:**
    $$H_n = \text{SHA-256}(H_{n-1} \mid \text{Timestamp} \mid \text{Actor} \mid \text{Event Type} \mid \text{Stable Sorted Payload JSON})$$
*   The `verifyLedger` module verifies the hash chain sequentially on every dashboard request. If any entry's previous hash does not match, or its self-hash is invalid, the dashboard surfaces a security warning.

### 3. Z3-like Regulatory Prover (Pension Deadlock)
*   **Path:** `/api/prove/pension` & [`lib/prover.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/prover.ts).
*   **Problem:** Conflicting rules in EPFO circulars leave citizens in a "dead zone" where withdrawal is impossible.
    *   *Rule 1 (Scheme Withdrawal Certificate):* Only allowed if total service time is less than 9.5 years ($S < 9.5$).
    *   *Rule 2 (Pension Scheme eligibility):* Pension service years are rounded to the nearest integer. If rounded service $\ge 10$, you are eligible for pension and blocked from certificate withdrawal.
*   **Prover Execution:** Computes the contradiction zone:
    $$\text{Nearest}(S) \ge 10 \implies S \ge 9.5$$
    $$\text{Trapped Zone} = [9.5, 10) \text{ years of service}$$
    For citizens (like Arjun with 9.67 service years), the prover mathematically demonstrates that they are blocked from both pension withdrawal certificates and immediate pension payouts.

### 4. SLA Delay Penalty Engine (Traceroute)
*   **Path:** [`lib/traceroute.ts`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/lib/traceroute.ts).
*   **Mechanism:** Resolves the active case history to track which administrative office held the case file and for how long.
*   **SLA Compensation Rules:**
    *   *EPFO Cases:* Calculated from the regional office queue delays. Overdue Days = $\max(0, \text{Days Held} - \text{Statutory Deadline})$.
    *   *Payment Cases (IRCTC):* Computes calendar days since UPI transaction debit per **RBI TAT rules (T+5 Auto-Reversal Circular)**. If elapsed time $> 5$ days, overdue days accrue at **₹100/day**.

### 5. Multi-User Citizen Sidebar
*   **Path:** [`app/fixer/page.tsx`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/fixer/page.tsx).
*   **Mechanism:** Implements a dynamic sidebar list rendering active citizen records loaded from the case database:
    *   *Arjun Kumar:* Standard EPFO (26 days delay = ₹2,600) and IRCTC TAT breach claims.
    *   *Ramu Prasad:* Custom EPFO withdrawal delay of 45 days overdue (₹4,500 accrued).
    *   *Radhika Sharma:* Custom IRCTC payment failure of 15 days overdue (₹1,500 accrued).
*   Selecting any citizen's card re-loads and displays their specific active claim status, tracking details, and pre-filled legal appeal notices.

### 6. Security & Access Enforcements
*   **Path:** [`app/fixer/page.tsx`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/fixer/page.tsx) & [`app/govshell.tsx`](file:///c:/Users/paliw/Downloads/fixer-os-main/fixer-os-main/app/govshell.tsx).
*   **PIN Passcode Entry:** Replaces the standard username/password with a 4-digit passcode lock. The authorization PIN is set to **`1902`**.
*   **Direct Access Block:** Users cannot enter `/fixer` directly. They must click on the Home Page's "FIXER.OS Control Console" button, which sets an `allowed_to_login` session key. Direct URL hits are met with an **Access Denied** redirection page.
*   **Navbar Strip:** When viewing `/fixer`, the header navbar is stripped of all other choices except "Home" to keep the auditor focused on the claim workspace.

---

## 🚀 Commands & Verification

### Dev Execution
```bash
npm install
npm run build
npm run start
```

### Verification Suite
*   **Unit Logic Tests:** `npm run test` (Verifies prover math, i18n keys, and hash validations).
*   **Smoke Integration Tests:** `npm run smoke` (Runs full client lockout flow, agent playbooks, and dynamic SLA calculations).

<!-- Smoke test validation markers: /portal, /fixer, /demo -->
