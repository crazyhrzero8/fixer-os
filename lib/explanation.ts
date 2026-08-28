import crypto from "crypto";
import type { CaseRecord } from "./ledger";

export type ExplanationDemand = {
  demandText: string;
  demandHash: string;
  hasAiDecision: boolean;
};

export function generateDPDP18DemandFromRecord(record: CaseRecord, lang: "en"|"hi" = "en"): ExplanationDemand {
  if (!record) {
    return { demandText: "", demandHash: "", hasAiDecision: false };
  }

  const lastEvent = record.events[record.events.length - 1];
  const hasAiDecision = lastEvent?.type === "AI_ASSESSMENT" || record.kind.includes("rejection");

  const enText = `DPDP Act 2023 §18 Demand for Explanation
To: Data Fiduciary (Governance Portal)
Case: ${record.id}
I request explanation of significant decision:
- Decision: ${record.status}
- Date: ${new Date(lastEvent?.ts || Date.now()).toISOString()}
- Request under DPDP §18: disclose logic involved, training data categories, and safeguards.
Ledger hash: ${lastEvent?.hash || ""}
`;

  const hiText = `DPDP अधिनियम 2023 धारा 18 स्पष्टीकरण मांग
प्रति: डेटा अभिभावक
केस: ${record.id}
मैं महत्वपूर्ण निर्णय का स्पष्टीकरण मांगता हूँ:
- निर्णय: ${record.status}
- तिथि: ${new Date(lastEvent?.ts || Date.now()).toISOString()}
`;

  const text = lang === "hi" ? hiText : enText;
  const demandHash = crypto.createHash("sha256").update(text).digest("hex");

  return { demandText: text, demandHash, hasAiDecision };
}
