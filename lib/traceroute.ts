import { APP_CONFIG } from "./config";
import { getRuleFromRegistry } from "./rules";
import { SYNTHETIC_TXN } from "../data/seed";
import { getSeedEvents, type LedgerEvent } from "./ledger";
import { getPrecedentForCase } from "./precedents";

export interface TraceNode {
  id: string;
  office: string;
  designation: string;
  statutoryDeadlineDays: number;
  daysHeld: number;
  rule: string;
  breached: boolean;
}

export function calendarDaysSince(isoTimestamp: string, now: number = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(isoTimestamp).getTime()) / 86_400_000));
}

export const SLA_COMPENSATION_PER_DAY = APP_CONFIG.sla.perDayRupees;

export function traceSummary(caseId: string, now?: number, facts?: any, events?: LedgerEvent[]) {
  const isTat = caseId.includes("irctc");
  const debitedAt = facts?.debitedAt || SYNTHETIC_TXN.debitedAt;
  
  const rulesGroup = "statutory-sla-rules";
  const activeEvents = events || getSeedEvents(caseId);
  
  const isSynthetic = caseId === "synthetic-epfo-001" || caseId === "ramu-epfo-001";
  const targetNow = isSynthetic
    ? (caseId === "synthetic-epfo-001" ? 1766184000000 : 1768776000000)
    : (now || Date.now());
  
  if (isTat) {
    const elapsed = calendarDaysSince(debitedAt, targetNow);
    
    // Load statutory limits from unified rules
    const gatewayRule = getRuleFromRegistry(rulesGroup, "irctc-gateway-limit");
    const refundsRule = getRuleFromRegistry(rulesGroup, "irctc-refunds-limit");
    
    const gatewayDeadline = gatewayRule ? Number(gatewayRule.test.right) : 5;
    const refundsDeadline = refundsRule ? Number(refundsRule.test.right) : 7;
    
    const nodes: TraceNode[] = [
      {
        id: "gateway",
        office: "Payment Gateway",
        designation: "Settlement ops (simulated)",
        statutoryDeadlineDays: gatewayDeadline,
        daysHeld: elapsed,
        rule: gatewayRule?.message || "RBI TAT circular",
        breached: elapsed > gatewayDeadline
      },
      {
        id: "irctc-refunds",
        office: "IRCTC Refunds (CCM)",
        designation: "Chief Commercial Manager (Refunds)",
        statutoryDeadlineDays: refundsDeadline,
        daysHeld: elapsed,
        rule: refundsRule?.message || "Railway Refund Rules 2015",
        breached: elapsed > refundsDeadline
      },
      {
        id: "bank-nodal",
        office: "Bank Nodal Officer",
        designation: "Principal Nodal Officer",
        statutoryDeadlineDays: 30,
        daysHeld: 0,
        rule: "RBI Integrated Ombudsman Scheme 2021 — escalation if TAT compensation not paid suo moto",
        breached: false
      }
    ];
    
    const blocker = [...nodes].reverse().find((node) => node.breached) ?? nodes[0];
    const daysOverdue = Math.max(0, elapsed - gatewayDeadline);
    return { nodes, blocker, daysOverdue, tatCompensationAccrued: daysOverdue * SLA_COMPENSATION_PER_DAY };
  } else {
    // EPFO cases (synthetic or Ramu or any future EPFO case)
    // Load statutory limits from unified rules
    const portalRule = getRuleFromRegistry(rulesGroup, "epfo-portal-limit");
    const fieldRule = getRuleFromRegistry(rulesGroup, "epfo-field-limit");
    const regionalRule = getRuleFromRegistry(rulesGroup, "epfo-regional-limit");
    
    const portalDeadline = portalRule ? Number(portalRule.test.right) : 1;
    const fieldDeadline = fieldRule ? Number(fieldRule.test.right) : 7;
    const regionalDeadline = regionalRule ? Number(regionalRule.test.right) : 15;
    
    // Derive daysHeld dynamically from ledger events
    const eFacts = activeEvents?.find((e) => e.type === "FACTS_VERIFIED");
    const eReject = activeEvents?.find((e) => e.type === "CLAIM_REJECTED");
    const eLockout = activeEvents?.find((e) => e.type === "GRIEVANCE_LOCKED_OUT");
    
    let portalDays = 0;
    if (eFacts) {
      const endTs = eReject ? eReject.ts : targetNow;
      portalDays = Math.max(0, Math.floor((endTs - eFacts.ts) / 86_400_000));
    }
    
    let fieldDays = 0;
    if (eReject) {
      const endTs = eLockout ? eLockout.ts : targetNow;
      fieldDays = Math.max(0, Math.floor((endTs - eReject.ts) / 86_400_000));
    }
    
    let regionalDays = 0;
    if (eLockout) {
      regionalDays = Math.max(0, Math.floor((targetNow - eLockout.ts) / 86_400_000));
    }
    
    const nodes: TraceNode[] = [
      {
        id: "portal",
        office: "Member Portal",
        designation: "Automated eligibility engine",
        statutoryDeadlineDays: portalDeadline,
        daysHeld: portalDays,
        rule: portalRule?.message || "Claim intake and automated validation",
        breached: portalDays > portalDeadline
      },
      {
        id: "field",
        office: "Field Office",
        designation: "Accounts Officer",
        statutoryDeadlineDays: fieldDeadline,
        daysHeld: fieldDays,
        rule: fieldRule?.message || "Claim verification queue",
        breached: fieldDays > fieldDeadline
      },
      {
        id: "regional",
        office: "Regional Office",
        designation: "Regional PF Commissioner",
        statutoryDeadlineDays: regionalDeadline,
        daysHeld: regionalDays,
        rule: regionalRule?.message || "Disposition and grievance supervision",
        breached: regionalDays > regionalDeadline
      },
      {
        id: "cpc",
        office: "Central Processing Centre",
        designation: "Zonal Additional CPFC",
        statutoryDeadlineDays: 30,
        daysHeld: 0,
        rule: "Escalation destination",
        breached: false
      }
    ];
    
    const blocker = [...nodes].reverse().find((node) => node.breached) ?? nodes[0];
    const daysOverdue = Math.max(0, blocker.daysHeld - blocker.statutoryDeadlineDays);
    return { nodes, blocker, daysOverdue, tatCompensationAccrued: daysOverdue * SLA_COMPENSATION_PER_DAY };
  }
}

export function escalationLetter(caseId: string, facts?: any, events?: LedgerEvent[]): string {
  const { blocker, daysOverdue, tatCompensationAccrued } = traceSummary(caseId, Date.now(), facts, events);
  const legalLine = getPrecedentForCase(caseId, facts);
  return `To: ${blocker.designation}, ${blocker.office}\n\nSubject: Escalation — case ${caseId}\n\nThe independent case ledger records the failure and every subsequent inaction. The case has remained at ${blocker.office} for ${blocker.daysHeld} days against a ${blocker.statutoryDeadlineDays}-day handling window — ${daysOverdue} days overdue (calendar days per RBI GI-4).\n\n${legalLine}\n\nThe SLA clock records ₹${tatCompensationAccrued.toLocaleString("en-IN")} for the overdue period (₹100/day). Please issue a written disposition and restore the citizen's grievance path.\n\nThis is a demonstration draft; verify applicable rules before use. Pecuniary jurisdiction per CP Jurisdiction Rules 2021: District ≤₹50L, State ₹50L–₹2Cr. eDaakhil: edaakhil.nic.in`;
}
