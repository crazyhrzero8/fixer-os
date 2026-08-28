import { NextResponse } from "next/server";
import { getCase, listCases, type CaseRecord } from "@/lib/ledger";
import { traceSummary } from "@/lib/traceroute";

export async function GET() {
  const options = await listCases();
  const fullRecords: CaseRecord[] = [];
  
  for (const opt of options) {
    const record = await getCase(opt.id);
    if (record) fullRecords.push(record);
  }
  
  let totalCases = fullRecords.length;
  let totalAccruedCompensation = 0;
  let totalOverdueDays = 0;
  
  const officeBreaches: Record<string, number> = {};
  const departmentDelays: Record<string, { totalDays: number; count: number }> = {
    EPFO: { totalDays: 0, count: 0 },
    Payments: { totalDays: 0, count: 0 }
  };
  
  for (const r of fullRecords) {
    const targetNow = r.id === "synthetic-epfo-001"
      ? 1766184000000
      : (r.id === "ramu-epfo-001" ? 1768776000000 : Date.now());
      
    const trace = traceSummary(r.id, targetNow, r.facts, r.events);
    
    totalAccruedCompensation += trace.tatCompensationAccrued;
    totalOverdueDays += trace.daysOverdue;
    
    if (trace.blocker.office) {
      officeBreaches[trace.blocker.office] = (officeBreaches[trace.blocker.office] || 0) + 1;
    }
    
    const dept = r.kind === "payment-tat-breach" ? "Payments" : "EPFO";
    departmentDelays[dept].totalDays += trace.daysOverdue;
    departmentDelays[dept].count += 1;
  }
  
  let worstOffice = "N/A";
  let maxBreaches = -1;
  for (const [office, count] of Object.entries(officeBreaches)) {
    if (count > maxBreaches) {
      maxBreaches = count;
      worstOffice = office;
    }
  }
  
  const avgDelayEpfo = departmentDelays.EPFO.count > 0
    ? Number((departmentDelays.EPFO.totalDays / departmentDelays.EPFO.count).toFixed(1))
    : 0;
  const avgDelayPayments = departmentDelays.Payments.count > 0
    ? Number((departmentDelays.Payments.totalDays / departmentDelays.Payments.count).toFixed(1))
    : 0;
    
  return NextResponse.json({
    totalCases,
    totalAccruedCompensation,
    totalOverdueDays,
    worstOffice,
    avgDelayEpfo,
    avgDelayPayments,
    officeBreaches
  });
}
