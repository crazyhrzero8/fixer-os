import { appendEvent, getCase, setCaseStatus } from "@/lib/ledger";
import { escalationLetter, traceSummary } from "@/lib/traceroute";
import { AGENT_MODE, decideNextAction } from "@/lib/llm";

export const AGENT_ACTIONS = ["INTERPRET_STATE", "DRAFT_REBUTTAL", "FILE_APPEAL", "CHECK_SLA", "ESCALATE"] as const;
export type AgentAction = (typeof AGENT_ACTIONS)[number];
export interface AgentResult { action: AgentAction; summary: string; detail: string; completed: boolean; mode: "llm" | "deterministic"; }

interface StepDef {
  marker: string;
  action: AgentAction;
  run: () => { summary: string; detail: string };
}

function buildSteps(): StepDef[] {
  const caseRecord = getCase();
  if (!caseRecord) throw new Error("Synthetic case not found");
  return [
    {
      marker: "FALSE_REJECTION_PROVEN",
      action: "INTERPRET_STATE",
      run: () => {
        appendEvent("agent", "FALSE_REJECTION_PROVEN", { field: "name", left: caseRecord.facts.nameAsPerEmployer, right: caseRecord.facts.nameAsPerAadhaar, result: "MATCH" });
        return { summary: "False rejection proven", detail: "The portal claims a mismatch; the independently verified member-ID and primary-UAN names are both Arjun Kumar." };
      }
    },
    {
      marker: "REBUTTAL_DRAFTED",
      action: "DRAFT_REBUTTAL",
      run: () => {
        appendEvent("agent", "REBUTTAL_DRAFTED", { subject: "Request for reversal of false name-mismatch rejection", evidence: "Verified names match in hash-chained ledger" });
        return { summary: "Evidence-backed rebuttal drafted", detail: "The draft cites matching-name evidence and requests a written disposition." };
      }
    },
    {
      marker: "APPEAL_FILED",
      action: "FILE_APPEAL",
      run: () => {
        appendEvent("agent", "APPEAL_FILED", { channel: "Escalation route", closureGap: "Grievance rejected its own tracking ID" });
        return { summary: "Appeal route opened", detail: "The agent records the invalid-tracking-ID closure gap rather than retrying the locked grievance form." };
      }
    },
    {
      marker: "SLA_BREACH_CALCULATED",
      action: "CHECK_SLA",
      run: () => {
        const sla = traceSummary();
        appendEvent("agent", "SLA_BREACH_CALCULATED", { daysOverdue: sla.daysOverdue, compensationAccrued: sla.tatCompensationAccrued, ratePerDay: 100 });
        return { summary: `SLA breach: ${sla.daysOverdue} days overdue`, detail: `The clock records ₹${sla.tatCompensationAccrued.toLocaleString("en-IN")} at ₹100/day for the overdue period.` };
      }
    },
    {
      marker: "ESCALATION_SENT",
      action: "ESCALATE",
      run: () => {
        appendEvent("agent", "ESCALATION_SENT", { addressee: traceSummary().blocker.designation, letter: escalationLetter() });
        appendEvent("system", "CASE_RESOLVED", { resolution: "Synthetic escalation packet prepared and routed" });
        setCaseStatus("RESOLVED");
        return { summary: "Escalation packet routed", detail: "The accountable blocking node is named, the evidence bundle is chained, and the synthetic case is ready for disposition." };
      }
    }
  ];
}

export async function nextAgentStep(): Promise<AgentResult> {
  const steps = buildSteps();
  const types = new Set(getCase()!.events.map((entry) => entry.type));
  const pending = steps.filter((step) => !types.has(step.marker));
  if (pending.length === 0) {
    return { action: "ESCALATE", summary: "Case already resolved", detail: "Restart the demo to replay the evidence trail.", completed: true, mode: "deterministic" };
  }

  let chosen = pending[0];
  let mode: "llm" | "deterministic" = "deterministic";

  if (AGENT_MODE === "llm") {
    try {
      const caseRecord = getCase()!;
      const decision = await decideNextAction({
        portalState: String(caseRecord.events.at(-1)?.payload.portalState ?? caseRecord.status),
        caseStatus: caseRecord.status,
        remainingActions: pending.map((step) => step.action),
        recentEvents: caseRecord.events.map((entry) => ({ actor: entry.actor, type: entry.type, payload: entry.payload }))
      });
      const match = pending.find((step) => step.action === decision.action);
      if (match) {
        chosen = match;
        mode = "llm";
        appendEvent("system", "LLM_DECISION", { chosenAction: decision.action, reasoning: decision.reasoning, allowListEnforced: true });
      }
    } catch {
      mode = "deterministic";
    }
  }

  const outcome = chosen.run();
  return { action: chosen.action, ...outcome, completed: chosen.marker === "ESCALATION_SENT", mode };
}
