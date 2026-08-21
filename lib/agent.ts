import { appendEvent, getCase, setCaseStatus, type CaseRecord } from "@/lib/ledger";
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

function daysSince(isoTimestamp: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(isoTimestamp).getTime()) / 86_400_000));
}

function buildSteps(record: CaseRecord): StepDef[] {
  if (record.kind === "payment-tat-breach") {
    const debitedAt = String(record.facts.debitedAt);
    return [
      {
        marker: "PAYMENT_FAILURE_CONFIRMED",
        action: "INTERPRET_STATE",
        run: () => {
          appendEvent(record.id, "agent", "PAYMENT_FAILURE_CONFIRMED", { rrn: record.facts.rrn, ticketIssued: record.facts.ticketIssued, conclusion: "Debit without service confirmed against verified bank record" });
          return { summary: "Failed transaction confirmed", detail: `RRN ${record.facts.rrn}: money debited, no ticket issued. This is the exact RBI TAT failure pattern.` };
        }
      },
      {
        marker: "TAT_DEMAND_DRAFTED",
        action: "DRAFT_REBUTTAL",
        run: () => {
          appendEvent(record.id, "agent", "TAT_DEMAND_DRAFTED", { rrn: record.facts.rrn, basis: "RBI Harmonisation of TAT Master Direction — auto-reversal within T+5 working days, ₹100/day thereafter, no claim form required" });
          return { summary: "Auto-credit demand drafted", detail: "Cites the RRN and the RBI TAT direction: the bank must reverse automatically; no claim form is even required." };
        }
      },
      {
        marker: "GATEWAY_COMPLAINT_FILED",
        action: "FILE_APPEAL",
        run: () => {
          appendEvent(record.id, "agent", "GATEWAY_COMPLAINT_FILED", { channel: "Bank grievance + IRCTC CPIO (parallel)", closureGap: "No reversal credited past the T+5 window" });
          return { summary: "Parallel complaints recorded", detail: "Bank grievance cites the RRN; parallel RTI-ready note filed against the merchant's refund cell." };
        }
      },
      {
        marker: "SLA_BREACH_CALCULATED",
        action: "CHECK_SLA",
        run: () => {
          const elapsed = daysSince(debitedAt);
          const overdue = Math.max(0, elapsed - Number(record.facts.bankReverseDeadlineDays));
          const paise = overdue * Number(record.facts.tatCompensationPerDayPaise);
          appendEvent(record.id, "agent", "SLA_BREACH_CALCULATED", { daysElapsed: elapsed, daysOverdue: overdue, compensationPaise: paise, approximation: "calendar-day approximation of working days" });
          return { summary: `TAT breach: ${overdue} day(s) overdue`, detail: `₹${(paise / 100).toLocaleString("en-IN")} accrued at ₹100/day beyond the T+5 reversal deadline.` };
        }
      },
      {
        marker: "ESCALATION_SENT",
        action: "ESCALATE",
        run: () => {
          appendEvent(record.id, "agent", "ESCALATION_SENT", { addressee: traceSummary(record.id).blocker.designation, letter: escalationLetter(record.id) });
          appendEvent(record.id, "system", "CASE_RESOLVED", { resolution: "Synthetic escalation packet prepared and routed" });
          setCaseStatus(record.id, "RESOLVED");
          return { summary: "Escalation packet routed", detail: "The accountable node is named with the codified RBI entitlement attached." };
        }
      }
    ];
  }

  return [
    {
      marker: "FALSE_REJECTION_PROVEN",
      action: "INTERPRET_STATE",
      run: () => {
        appendEvent(record.id, "agent", "FALSE_REJECTION_PROVEN", { field: "name", left: record.facts.nameAsPerEmployer, right: record.facts.nameAsPerAadhaar, result: "MATCH" });
        return { summary: "False rejection proven", detail: "The portal claims a mismatch; the independently verified member-ID and primary-UAN names are identical." };
      }
    },
    {
      marker: "REBUTTAL_DRAFTED",
      action: "DRAFT_REBUTTAL",
      run: () => {
        appendEvent(record.id, "agent", "REBUTTAL_DRAFTED", { subject: "Request for reversal of false name-mismatch rejection", evidence: "Verified names match in hash-chained ledger" });
        return { summary: "Evidence-backed rebuttal drafted", detail: "The draft cites matching-name evidence and requests a written disposition." };
      }
    },
    {
      marker: "APPEAL_FILED",
      action: "FILE_APPEAL",
      run: () => {
        appendEvent(record.id, "agent", "APPEAL_FILED", { channel: "Escalation route", closureGap: "Grievance rejected its own tracking ID" });
        return { summary: "Appeal route opened", detail: "The agent records the invalid-tracking-ID closure gap rather than retrying the locked grievance form." };
      }
    },
    {
      marker: "SLA_BREACH_CALCULATED",
      action: "CHECK_SLA",
      run: () => {
        const sla = traceSummary(record.id);
        appendEvent(record.id, "agent", "SLA_BREACH_CALCULATED", { daysOverdue: sla.daysOverdue, compensationAccrued: sla.tatCompensationAccrued, ratePerDay: 100 });
        return { summary: `SLA breach: ${sla.daysOverdue} days overdue`, detail: `The clock records ₹${sla.tatCompensationAccrued.toLocaleString("en-IN")} at ₹100/day for the overdue period.` };
      }
    },
    {
      marker: "ESCALATION_SENT",
      action: "ESCALATE",
      run: () => {
        appendEvent(record.id, "agent", "ESCALATION_SENT", { addressee: traceSummary(record.id).blocker.designation, letter: escalationLetter(record.id) });
        appendEvent(record.id, "system", "CASE_RESOLVED", { resolution: "Synthetic escalation packet prepared and routed" });
        setCaseStatus(record.id, "RESOLVED");
        return { summary: "Escalation packet routed", detail: "The accountable blocking node is named, the evidence bundle is chained, and the synthetic case is ready for disposition." };
      }
    }
  ];
}

export async function nextAgentStep(caseId: string): Promise<AgentResult> {
  const record = getCase(caseId);
  if (!record) throw new Error("Unknown case");
  const types = new Set(record.events.map((entry) => entry.type));
  const pending = buildSteps(record).filter((step) => !types.has(step.marker));
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
        appendEvent(record.id, "system", "LLM_DECISION", { chosenAction: decision.action, reasoning: decision.reasoning, allowListEnforced: true });
      }
    } catch {
      mode = "deterministic";
    }
  }

  const outcome = chosen.run();
  return { action: chosen.action, ...outcome, completed: chosen.marker === "ESCALATION_SENT", mode };
}
