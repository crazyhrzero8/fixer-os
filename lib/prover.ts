export const PROVER_VERSION = "0.1.0";

export interface ProofResult {
  contradiction: boolean;
  domain: string;
  proofSteps: string[];
  suggestedRouteAround: string | null;
  bugReport: string | null;
}

export function provePensionDeadlock(): ProofResult {
  const steps = [
    "Rule A (documented EPFO behavior): partial withdrawal allowed only if service < 9.5 years.",
    "Rule B (documented EPFO behavior): monthly pension allowed only if service >= 10 years.",
    "Domain under test: service in [9.5, 10).",
    "For all s in [9.5, 10): s < 9.5 is false, so Rule A forbids withdrawal.",
    "For all s in [9.5, 10): s >= 10 is false, so Rule B forbids pension.",
    "No outcome is permitted for any s in [9.5, 10). QED."
  ];
  return {
    contradiction: true,
    domain: "serviceYears ∈ [9.5, 10)",
    proofSteps: steps,
    suggestedRouteAround:
      "File manual application at field office with annexure citing the rule conflict; demand written disposition within statutory timeline.",
    bugReport:
      "BUG: eligibility engine leaves service ∈ [9.5,10) with no reachable outcome. Fix: unify boundary condition (>=9.5 or >10) and add regression test for interval edges."
  };
}
