# FIXER.OS

**Everyone built compliance copilots for citizens. Nobody audits the state back.**

An independent hackathon prototype for [Build What Moves India](https://buildwhatmovesindia.com)
(Varun Mayya × OpenAI, submissions due Aug 27 2026). FIXER.OS is the accountability layer
between citizens and hostile public-service portals:

- **False-rejection audit** — cross-examines a portal's rejection reason against an
  independent, hash-chained ledger of the citizen's verified facts and proves contradictions.
- **Kaun Zimmedar traceroute** — renders the case route through offices with statutory
  deadlines and days-overdue counters; names the blocking node.
- **RuleGuard proof** — mechanically proves rule-system deadlocks (e.g. the documented EPFO
  pension paradox for service ∈ [9.5, 10) years) and emits a developer-ready bug report.
- **SLA clock in rupees** — accrues the ₹100/day compensation already mandated by RBI's TAT
  framework for failed transactions.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · SHA-256 append-only in-memory demo ledger ·
deterministic, allow-listed agent loop.

## Architecture

```text
Mock portal → rejection/grievance events ┐
Verified synthetic facts ────────────────┼→ hash-chained case ledger → FIXER.OS agent
RuleGuard interval proof ────────────────┤                         ├→ rebuttal + escalation packet
Mock office route ───────────────────────┘                         └→ accountable traceroute + SLA clock
```

The prototype is intentionally deterministic: it runs without an API key and only permits the
five published agent actions. This makes the live demo repeatable and keeps untrusted portal text
from becoming executable instructions.

## Structure

```
app/          landing + /portal (mock villain) + /fixer (agent console) + /demo (theater)
lib/          ledger (hash chain), deterministic agent, traceroute, RuleGuard proof
playbooks/    JSON playbooks with documented-case provenance notes
data/         synthetic seed citizen (no real personal data, ever)
docs/         research dossier behind the idea
```

## Run

```bash
npm install
cp .env.example .env.local   # add your OpenAI key
npm run dev
```

## Compliance notes

- Independent prototype. Not affiliated with EPFO or any government body.
- No live government systems are touched; no real personal data is used anywhere.
- `CODEX_LOG.md` records the phase-by-phase build contribution (Codex-mandated by rules).

## License

MIT
