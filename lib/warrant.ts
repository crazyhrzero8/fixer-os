import { traceSummary } from "./traceroute";
import type { CaseRecord } from "./ledger";
import crypto from "crypto";

export type WarrantOutput = {
  warrantText: string;
  warrantHash: string;
  hasBreachRisk: boolean;
  statutoryRefs: string[];
};

export function generateProspectiveWarrantFromRecord(record: CaseRecord, lang: "en"|"hi" = "en"): WarrantOutput {
  if (!record) {
    return { warrantText: "", warrantHash: "", hasBreachRisk: false, statutoryRefs: [] };
  }
  const trace = traceSummary(record.id);
  const dueDays = trace.nodes[0]?.statutoryDeadlineDays ?? 0;
  const held = trace.nodes[0]?.daysHeld ?? 0;
  const predictedBreachDays = Math.max(0, dueDays - held);
  const hasRisk = predictedBreachDays > 0 && predictedBreachDays <= 3;

  const office = trace.nodes[0]?.office || "Nodal Office";
  const rule = trace.nodes[0]?.rule || "Statutory SLA";
  const statutoryRefs = ["RTI Act 2005 §6(1)", "Citizen Charter 2023", rule];

  const enText = `PROSPECTIVE LIABILITY WARRANT
To: ${office}, Nodal Officer
Re: Anticipated breach of ${rule} for Case ${record.id}
Facts:
- Statutory deadline: ${dueDays} days
- Days held to date: ${held}
- Predicted breach in: ${predictedBreachDays} days
Demand:
Under ${statutoryRefs.join(", ")}, take corrective action within 48 hours to prevent breach.
Failure to act will result in formal escalation and compensation claim.
Issued on: ${new Date().toISOString()}
Ledger hash: ${record.events[record.events.length-1]?.hash || ""}
`;

  const hiText = `पूर्वदायित्व वारंट
प्रति: ${office}, नोडल अधिकारी
विषय: केस ${record.id} के लिए ${rule} का संभावित उल्लंघन
तथ्य:
- वैधानिक समय सीमा: ${dueDays} दिन
- अब तक रखे गए दिन: ${held}
- अनुमानित उल्लंघन: ${predictedBreachDays} दिन में
माँग:
${statutoryRefs.join(", ")} के तहत, उल्लंघन रोकने के लिए 48 घंटे में सुधारात्मक कार्रवाई करें।
`;

  const text = lang === "hi" ? hiText : enText;
  const warrantHash = crypto.createHash("sha256").update(text).digest("hex");

  return { warrantText: text, warrantHash, hasBreachRisk: hasRisk, statutoryRefs };
}
