import { APP_CONFIG } from "./config";
import { CASE_IDS } from "./ledger";

export interface TraceNode { id: string; office: string; designation: string; statutoryDeadlineDays: number; daysHeld: number; rule: string; breached: boolean; }

const EPFO_TRACE: TraceNode[] = [
  { id: "portal", office: "Member Portal", designation: "Automated eligibility engine", statutoryDeadlineDays: 1, daysHeld: 7, rule: "Claim intake and automated validation", breached: true },
  { id: "field", office: "Field Office", designation: "Accounts Officer", statutoryDeadlineDays: 7, daysHeld: 12, rule: "Claim verification queue", breached: true },
  { id: "regional", office: "Regional Office", designation: "Regional PF Commissioner", statutoryDeadlineDays: 15, daysHeld: 41, rule: "Disposition and grievance supervision", breached: true },
  { id: "cpc", office: "Central Processing Centre", designation: "Zonal Additional CPFC", statutoryDeadlineDays: 30, daysHeld: 0, rule: "Escalation destination", breached: false }
];

const TAT_TRACE: TraceNode[] = [
  { id: "gateway", office: "Payment Gateway", designation: "Settlement ops (simulated)", statutoryDeadlineDays: 5, daysHeld: 11, rule: "RBI TAT: auto-reverse failed debit within T+5 working days", breached: true },
  { id: "irctc-refunds", office: "IRCTC Refunds (CCM)", designation: "Chief Commercial Manager (Refunds)", statutoryDeadlineDays: 7, daysHeld: 11, rule: "Refund Rules 2015 — failed-transaction reversal", breached: true },
  { id: "bank-nodal", office: "Bank Nodal Officer", designation: "Principal Nodal Officer", statutoryDeadlineDays: 30, daysHeld: 0, rule: "RBI Banking Ombudsman escalation destination", breached: false }
];

export const SLA_COMPENSATION_PER_DAY = APP_CONFIG.sla.perDayRupees;
const TRACES: Record<string, TraceNode[]> = { [CASE_IDS.epfo]: EPFO_TRACE, [CASE_IDS.irctc]: TAT_TRACE };

export function traceSummary(caseId: string) {
  const nodes = TRACES[caseId] ?? EPFO_TRACE;
  const blocker = [...nodes].reverse().find((node) => node.breached) ?? nodes[0];
  const daysOverdue = Math.max(0, blocker.daysHeld - blocker.statutoryDeadlineDays);
  return { nodes, blocker, daysOverdue, tatCompensationAccrued: daysOverdue * SLA_COMPENSATION_PER_DAY };
}

export function escalationLetter(caseId: string): string {
  const { blocker, daysOverdue, tatCompensationAccrued } = traceSummary(caseId);
  const isTat = caseId === CASE_IDS.irctc;
  const legalLine = isTat
    ? "RBI circular DPSS.CO.PD No.629/02.01.014/2019-20 (effective 15 Oct 2019) mandates suo-moto auto-reversal of this failed debit within T+5 days and ₹100/day compensation thereafter — no claim form is required, and para 5 obliges the bank to credit it without waiting for a complaint."
    : "The Chandigarh Consumer Commission (March 2026) held that software glitches do not excuse unexplained delays by EPFO — deficiency in service under CPA 2019.";
  return `To: ${blocker.designation}, ${blocker.office}\n\nSubject: Escalation — synthetic case ${caseId}\n\nThe independent case ledger records the failure and every subsequent inaction. The case has remained at ${blocker.office} for ${blocker.daysHeld} days against a ${blocker.statutoryDeadlineDays}-day handling window — ${daysOverdue} days overdue.\n\n${legalLine}\n\nThe demo SLA clock records ₹${tatCompensationAccrued.toLocaleString("en-IN")} for the overdue period. Please issue a written disposition and restore the citizen's grievance path.\n\nThis is a synthetic demonstration draft; verify applicable rules before use.`;
}
