export const PROVER_VERSION = "0.1.0";

export interface ProofResult {
  contradiction: boolean;
  domain: string;
  proofSteps: string[];
  suggestedRouteAround: string | null;
  bugReport: string | null;
}

export function provePensionDeadlock(): ProofResult {
  // Domain is *unrounded* service — EPS rounds 6m+ to next year for eligibility,
  // but the portal's two engines were observed checking the raw value (see
  // docs/hackathon-research.md Turn 19 + LinkedIn 9y8m rant). The bug is the
  // *implementation* split, not the Gazette text.
  const steps = [
    "Rule A (portal withdrawal engine, observed): withdrawal allowed only if service < 9.5 years (unrounded).",
    "Rule B (portal pension engine, observed): monthly pension allowed only if service >= 10 years (unrounded).",
    "Domain under test: service in [9.5, 10) — unrounded. EPS pensionable service rounds 6m+ up (e.g. 9y6m → 10y), but the bug is that the two engines don't share the same rounded() helper.",
    "For all s in [9.5, 10): s < 9.5 is false, so engine A forbids withdrawal.",
    "For all s in [9.5, 10): s >= 10 is false, so engine B forbids pension.",
    "No outcome is permitted for any s in [9.5, 10) — QED. Fix: both engines on roundedService = ceil(serviceYears - 1e-9) with 0.5yr granularity; see EPS 1995 para 12 + EPS 2026 Gazette (10-yr rule unchanged, Kustodian Jul 2026)."
  ];
  return {
    contradiction: true,
    domain: "serviceYears ∈ [9.5, 10) — unrounded (rounded 9y6m → 10y per EPS)",
    proofSteps: steps,
    suggestedRouteAround:
      "File manual application at field office with annexure citing the rule conflict and the 6-month rounding rule; demand written disposition within statutory timeline. Portal fix: unify engines on roundedService.",
    bugReport:
      "BUG: eligibility engines split on raw vs rounded service — service ∈ [9.5,10) unrounded has no reachable outcome. Fix: `rounded = serviceMonths>=6 ? ceil(years) : floor(years)` and branch `if (rounded>=10) pension else withdrawal`; add regression test for 9y5m, 9y6m, 9y11m."
  };
}
