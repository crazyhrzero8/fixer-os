import { getCase } from "@/lib/ledger";
import { getUnifiedRules, evaluateRule } from "./rules";

export interface PreflightResult {
  ruleId: string;
  status: "PASS" | "FAIL" | "WARN";
  message: string;
  fix: string;
}

export async function runPreflight(caseId: string): Promise<PreflightResult[]> {
  const record = await getCase(caseId);
  const registry = getUnifiedRules();
  if (!record || !registry[record.kind]) return [];
  const ctx = { facts: record.facts };
  return registry[record.kind].rules.map((rule) => evaluateRule(rule, ctx));
}
