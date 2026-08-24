import { APP_CONFIG } from "./config";
import { CASE_IDS } from "./ledger";
import { SYNTHETIC_TXN } from "../data/seed";

export interface TraceNode { id: string; office: string; designation: string; statutoryDeadlineDays: number; daysHeld: number; rule: string; breached: boolean; }

export function calendarDaysSince(isoTimestamp: string, now: number = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(isoTimestamp).getTime()) / 86_400_000));
}

const EPFO_TRACE: TraceNode[] = [
  { id: "portal", office: "Member Portal", designation: "Automated eligibility engine", statutoryDeadlineDays: 1, daysHeld: 7, rule: "Claim intake and automated validation", breached: true },
  { id: "field", office: "Field Office", designation: "Accounts Officer", statutoryDeadlineDays: 7, daysHeld: 12, rule: "Claim verification queue", breached: true },
  { id: "regional", office: "Regional Office", designation: "Regional PF Commissioner", statutoryDeadlineDays: 15, daysHeld: 41, rule: "Disposition and grievance supervision", breached: true },
  { id: "cpc", office: "Central Processing Centre", designation: "Zonal Additional CPFC", statutoryDeadlineDays: 30, daysHeld: 0, rule: "Escalation destination", breached: false }
];

function tatNodes(now: number): TraceNode[] {
  const elapsed = calendarDaysSince(SYNTHETIC_TXN.debitedAt, now);
  return [
    { id: "gateway", office: "Payment Gateway", designation: "Settlement ops (simulated)", statutoryDeadlineDays: 5, daysHeld: elapsed, rule: "RBI TAT (DPSS.CO.PD No.629/02.01.014/2019-20, 20 Sep 2019, Annex 4b): auto-reverse failed UPI merchant debit within T+5 calendar days (T=calendar date, GI-4)", breached: elapsed > 5 },
    { id: "irctc-refunds", office: "IRCTC Refunds (CCM)", designation: "Chief Commercial Manager (Refunds)", statutoryDeadlineDays: 7, daysHeld: elapsed, rule: "Railway Refund Rules 2015 — failed-transaction reversal (parallel to RBI TAT)", breached: elapsed > 7 },
    { id: "bank-nodal", office: "Bank Nodal Officer", designation: "Principal Nodal Officer", statutoryDeadlineDays: 30, daysHeld: 0, rule: "RBI Integrated Ombudsman Scheme 2021 — escalation if TAT compensation not paid suo moto (circular para 6)", breached: false }
  ];
}

export const SLA_COMPENSATION_PER_DAY = APP_CONFIG.sla.perDayRupees;
const TRACES: Record<string, TraceNode[]> = { [CASE_IDS.epfo]: EPFO_TRACE };

export function traceSummary(caseId: string, now: number = Date.now()) {
  const isTat = caseId === CASE_IDS.irctc;
  const nodes = isTat ? tatNodes(now) : (TRACES[caseId] ?? EPFO_TRACE);
  const blocker = [...nodes].reverse().find((node) => node.breached) ?? nodes[0];
  const daysOverdue = isTat
    ? Math.max(0, calendarDaysSince(SYNTHETIC_TXN.debitedAt, now) - 5)
    : Math.max(0, blocker.daysHeld - blocker.statutoryDeadlineDays);
  return { nodes, blocker, daysOverdue, tatCompensationAccrued: daysOverdue * SLA_COMPENSATION_PER_DAY };
}

export function escalationLetter(caseId: string): string {
  const { blocker, daysOverdue, tatCompensationAccrued } = traceSummary(caseId);
  const isTat = caseId === CASE_IDS.irctc;
  const legalLine = isTat
    ? "RBI circular DPSS.CO.PD No.629/02.01.014/2019-20 (20 Sep 2019, Annex 4b, T+5 calendar days, para 5 suo moto) mandates auto-reversal of this failed UPI merchant debit within T+5 calendar days and ₹100/day compensation thereafter — no claim form is required; para 5 obliges the bank to credit it suo moto, and para 6 routes denial to the RBI Integrated Ombudsman Scheme 2021."
    : "EPFO has been held to be a service provider for CPA 2019 §2(11) deficiency — most recently Kangra Consumer Commission CC/297/2025 (Abhinay Katoch vs EPFO, 20 Jul 2026) awarding shortfall + 9% interest + ₹1,000 harassment + ₹2,500 costs for arbitrarily rounding down service period (LiveLaw). The Chandigarh line on software glitches not excusing delay applies in parallel.";
  return `To: ${blocker.designation}, ${blocker.office}\n\nSubject: Escalation — synthetic case ${caseId}\n\nThe independent case ledger records the failure and every subsequent inaction. The case has remained at ${blocker.office} for ${blocker.daysHeld} days against a ${blocker.statutoryDeadlineDays}-day handling window — ${daysOverdue} days overdue (calendar days per RBI GI-4).\n\n${legalLine}\n\nThe demo SLA clock records ₹${tatCompensationAccrued.toLocaleString("en-IN")} for the overdue period (₹100/day). Please issue a written disposition and restore the citizen's grievance path.\n\nThis is a synthetic demonstration draft; verify applicable rules before use. Pecuniary jurisdiction per CP Jurisdiction Rules 2021: District ≤₹50L, State ₹50L–₹2Cr. eDaakhil: edaakhil.nic.in`;
}
