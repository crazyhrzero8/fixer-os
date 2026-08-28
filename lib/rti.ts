import { type CaseRecord } from "./ledger";
import { traceSummary } from "./traceroute";

export function generateRtiDraft(caseRecord: CaseRecord): string {
  const targetNow = caseRecord.id === "synthetic-epfo-001"
    ? 1766184000000
    : (caseRecord.id === "ramu-epfo-001" ? 1768776000000 : Date.now());

  const trace = traceSummary(caseRecord.id, targetNow, caseRecord.facts, caseRecord.events);
  const isTat = caseRecord.kind === "payment-tat-breach";
  
  const publicAuthority = isTat
    ? "Public Sector Bank / Nodal Officer (refund ops)"
    : "Employees' Provident Fund Organisation (EPFO)";
  const citizenName = String(caseRecord.facts.displayName || caseRecord.facts.nameAsPerAadhaar || "Citizen");
  const refId = isTat ? String(caseRecord.facts.rrn) : String(caseRecord.facts.claimTrackingId || "Not Available");

  return `FORM 'A'
Rule 3(1) of RTI Rules

APPLICATION FOR OBTAINING INFORMATION UNDER SECTION 6(1) OF THE RTI ACT, 2005

To,
The Central Public Information Officer (CPIO)
Office of the: ${publicAuthority}

1. Full Name of the Applicant: ${citizenName}
2. Address: Registered on citizen UAN/bank records
3. Particulars of Information Required:
   Subject: Request for information regarding progress of case/reference: ${refId}.
   
   Please provide the following records/information under Section 6(1) of the RTI Act:
   a) Detailed daily progress report of the handling of reference/grievance ${refId} from the date of submission to the date of this application.
   b) Names, designations, and official e-office identifiers of all officers who handled or processed the file, along with the dates the file remained with each official.
   c) The specific reason, written notes, and correspondence records explaining why the statutory handling limit of ${trace.blocker.statutoryDeadlineDays} days was breached at the ${trace.blocker.office} level.
   d) Certified copies of all file notes, official emails, e-office logs, and decision templates processed concerning this case.

4. Application Fee Details: Court Fee stamp of ₹10 attached (or paid online).
5. Information delivery mode: Speed post / registered email.

I state that I am a citizen of India and the information sought falls within the jurisdiction of the CPIO.

Date: ${new Date(targetNow).toLocaleDateString("en-IN")}
Place: India

Signature of Applicant
`;
}
