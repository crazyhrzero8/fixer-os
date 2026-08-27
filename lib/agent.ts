import { readFileSync } from "fs";
import path from "path";
import { appendEvent, CASE_IDS, getCase, setCaseStatus, type CaseRecord } from "@/lib/ledger";
import { calendarDaysSince, escalationLetter, SLA_COMPENSATION_PER_DAY, traceSummary } from "@/lib/traceroute";
import { AGENT_MODE, decideNextAction } from "@/lib/llm";
import { playbookSchema, renderDeep, type Playbook, type PlaybookStep } from "@/lib/playbooks";

export const AGENT_ACTIONS = ["INTERPRET_STATE", "DRAFT_REBUTTAL", "FILE_APPEAL", "CHECK_SLA", "ESCALATE"] as const;
export type AgentAction = (typeof AGENT_ACTIONS)[number];
export interface AgentResult { action: AgentAction; summary: string; detail: string; completed: boolean; mode: "llm" | "deterministic"; }

const playbookDir = path.join(process.cwd(), "playbooks");
const byCaseId = new Map<string, Playbook>();
for (const file of ["epfo-false-rejection.json", "payment-tat-breach.json"]) {
  const parsed = playbookSchema.parse(JSON.parse(readFileSync(path.join(playbookDir, file), "utf-8")));
  byCaseId.set(parsed.caseId, parsed);
}

function buildContext(record: CaseRecord): Record<string, unknown> {
  const trace = traceSummary(record.id, Date.now(), record.facts);
  const base: Record<string, unknown> = {
    facts: record.facts,
    trace: { blocker: trace.blocker, daysOverdue: trace.daysOverdue, tatCompensationAccrued: trace.tatCompensationAccrued },
    sla: { perDayRupees: SLA_COMPENSATION_PER_DAY },
    letter: escalationLetter(record.id, record.facts)
  };
  if (record.kind === "payment-tat-breach") {
    const elapsed = calendarDaysSince(String(record.facts.debitedAt));
    const overdue = trace.daysOverdue;
    const paise = overdue * Number(record.facts.tatCompensationPerDayPaise);
    base.tat = { daysElapsed: elapsed, daysOverdue: overdue, compensationPaise: paise, compensationRupees: (paise / 100).toLocaleString("en-IN") };
  }
  return base;
}

export async function nextAgentStep(caseId: string): Promise<AgentResult> {
  const record = await getCase(caseId);
  if (!record) throw new Error("Unknown case");
  const playbookKey = record.kind === "payment-tat-breach" ? "synthetic-irctc-001" : "synthetic-epfo-001";
  const playbook = byCaseId.get(playbookKey);
  if (!playbook) throw new Error("No playbook for case");

  const types = new Set(record.events.map((entry) => entry.type));
  const pending: PlaybookStep[] = playbook.steps.filter((step) => !types.has(step.marker));
  if (pending.length === 0) {
    return { action: "ESCALATE", summary: "Case already resolved", detail: "Restart the case to replay the evidence trail.", completed: true, mode: "deterministic" };
  }

  let chosen = pending[0];
  let mode: "llm" | "deterministic" = "deterministic";

  if (AGENT_MODE === "llm") {
    try {
      const decision = await decideNextAction({
        caseKind: record.kind,
        caseStatus: record.status,
        remainingActions: pending.map((step) => step.action),
        recentEvents: record.events.map((entry) => ({ actor: entry.actor, type: entry.type, payload: entry.payload }))
      });
      const match = pending.find((step) => step.action === decision.action);
      if (match) {
        chosen = match;
        mode = "llm";
        await appendEvent(record.id, "system", "LLM_DECISION", { provider: decision.provider, chosenAction: decision.action, reasoning: decision.reasoning, allowListEnforced: true });
      }
    } catch {
      mode = "deterministic";
    }
  }

  const ctx = buildContext(record);
  const rendered = renderDeep(chosen, ctx);
  await appendEvent(record.id, rendered.event.actor, rendered.event.type, rendered.event.payload as Record<string, unknown>);
  if (rendered.complete) {
    await appendEvent(record.id, "system", rendered.complete.systemEvent.type, rendered.complete.systemEvent.payload as Record<string, unknown>);
    await setCaseStatus(record.id, "RESOLVED");
  }
  return { action: rendered.action, summary: rendered.summary, detail: rendered.detail, completed: Boolean(rendered.complete), mode };
}
