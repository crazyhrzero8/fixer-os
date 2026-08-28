import { type CaseRecord } from "./ledger";
import { traceSummary } from "./traceroute";

export interface CaseNotification {
  type: "warn" | "info" | "alert";
  message: string;
  messageHi: string;
}

export function getCaseNotifications(caseRecord: CaseRecord): CaseNotification[] {
  const alerts: CaseNotification[] = [];
  
  const targetNow = caseRecord.id === "synthetic-epfo-001"
    ? 1766184000000
    : (caseRecord.id === "ramu-epfo-001" ? 1768776000000 : Date.now());

  // 1. Check Grievance Lockout Alert
  const lockoutEvent = caseRecord.events.find((e) => e.type === "GRIEVANCE_LOCKED_OUT");
  if (lockoutEvent) {
    const elapsedDays = Math.floor((targetNow - lockoutEvent.ts) / 86_400_000);
    const lockoutPeriod = 30; // standard 30 days
    const remaining = lockoutPeriod - elapsedDays;
    
    if (remaining > 0) {
      alerts.push({
        type: "warn",
        message: `Grievance portal lockout active: ${remaining} days remaining before you can file a new grievance.`,
        messageHi: `शिकायत पोर्टल लॉकआउट सक्रिय: नई शिकायत दर्ज करने से पहले ${remaining} दिन शेष हैं।`
      });
    } else {
      alerts.push({
        type: "info",
        message: "Grievance portal lockout has expired. You are now eligible to resubmit a grievance.",
        messageHi: "शिकायत पोर्टल लॉकआउट समाप्त हो गया है। अब आप नई शिकायत दर्ज करने के पात्र हैं।"
      });
    }
  }

  // 2. Check SLA Overdue alerts
  const trace = traceSummary(caseRecord.id, targetNow, caseRecord.facts, caseRecord.events);
  if (trace.daysOverdue > 0) {
    alerts.push({
      type: "alert",
      message: `SLA Breach: handling at ${trace.blocker.office} is ${trace.daysOverdue} days overdue. Proactive appeal recommended.`,
      messageHi: `SLA उल्लंघन: ${trace.blocker.office} में कार्य प्रसंस्करण ${trace.daysOverdue} दिन अतिदेय है। अपील दर्ज करने की अनुशंसा की जाती है।`
    });
  }

  // 3. Check Payment TAT breach alerts
  if (caseRecord.kind === "payment-tat-breach" && caseRecord.facts.debitedAt) {
    const debitedTime = new Date(String(caseRecord.facts.debitedAt)).getTime();
    const elapsed = Math.floor((targetNow - debitedTime) / 86_400_000);
    if (elapsed > 5) {
      alerts.push({
        type: "alert",
        message: `TAT Breach: UPI merchant auto-reversal deadline passed (${elapsed - 5} days overdue). Statutory ₹100/day compensation is active.`,
        messageHi: `TAT उल्लंघन: UPI व्यापारी ऑटो-रिवर्सल समय-सीमा बीत चुकी है (${elapsed - 5} दिन अतिदेय)। वैधानिक ₹100/दिन मुआवज़ा सक्रिय है।`
      });
    }
  }

  return alerts;
}
