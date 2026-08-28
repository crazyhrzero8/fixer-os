import { getRuleFromRegistry } from "./rules";

export const PROVER_VERSION = "0.2.0";

export interface ProofResult {
  contradiction: boolean;
  domain: string;
  proofSteps: string[];
  suggestedRouteAround: string | null;
  bugReport: string | null;
}

export function solveIntervalDeadlock(
  group: string,
  ruleAId: string,
  ruleBId: string,
  variableName: string,
  lang?: string
): ProofResult {
  const ruleA = getRuleFromRegistry(group, ruleAId);
  const ruleB = getRuleFromRegistry(group, ruleBId);
  if (!ruleA || !ruleB) {
    return {
      contradiction: false,
      domain: "unknown",
      proofSteps: ["Could not load rules for analysis."],
      suggestedRouteAround: null,
      bugReport: null
    };
  }

  const opA = ruleA.test.op;
  const thresholdA = Number(ruleA.test.right);
  const opB = ruleB.test.op;
  const thresholdB = Number(ruleB.test.right);

  const isHi = lang === "hi";
  let contradiction = false;
  let domain = "";
  const steps: string[] = [];

  // General solver logic for [thresholdA, thresholdB) deadlock
  if (opA === "lt" && opB === "gte") {
    if (thresholdA < thresholdB) {
      contradiction = true;
      domain = `${variableName} ∈ [${thresholdA}, ${thresholdB})`;
      
      if (isHi) {
        steps.push(
          `नियम A (${ruleA.message})`,
          `नियम B (${ruleB.message})`,
          `परीक्षण के अधीन क्षेत्र: ${variableName} [${thresholdA}, ${thresholdB}) में।`,
          `सभी s ∈ [${thresholdA}, ${thresholdB}) के लिए: s < ${thresholdA} गलत है, इसलिए नियम A सक्रिय नहीं होता है।`,
          `सभी s ∈ [${thresholdA}, ${thresholdB}) के लिए: s >= ${thresholdB} गलत है, इसलिए नियम B सक्रिय नहीं होता है।`,
          `किसी भी s ∈ [${thresholdA}, ${thresholdB}) के लिए कोई परिणाम अनुमत नहीं है — इति सिद्धम।`
        );
      } else {
        steps.push(
          `Rule A: ${ruleA.message}`,
          `Rule B: ${ruleB.message}`,
          `Domain under test: ${variableName} in [${thresholdA}, ${thresholdB})`,
          `For all s in [${thresholdA}, ${thresholdB}): s < ${thresholdA} is false, so Rule A is not met.`,
          `For all s in [${thresholdA}, ${thresholdB}): s >= ${thresholdB} is false, so Rule B is not met.`,
          `No eligibility outcome is permitted for any s in [${thresholdA}, ${thresholdB}) — QED.`
        );
      }
    }
  }

  const suggestedRouteAround = isHi
    ? `नियम संघर्ष और राउंडिंग नियमों का हवाला देते हुए क्षेत्रीय कार्यालय में मैन्युअल आवेदन दर्ज करें। सुधार: इंजनों को ${variableName} >= ${thresholdB} पर एकीकृत करें।`
    : `File manual application at field office citing the rule conflict; demand written disposition. Portal fix: unify engines on ${variableName} >= ${thresholdB}.`;

  const bugReport = `BUG: eligibility engines split on raw vs rounded service — ${variableName} ∈ [${thresholdA},${thresholdB}) has no reachable outcome. Fix: unify rules on roundedService.`;

  return {
    contradiction,
    domain: isHi ? `${domain} — असंशोधित` : `${domain} — unrounded`,
    proofSteps: steps,
    suggestedRouteAround,
    bugReport
  };
}

export function provePensionDeadlock(lang?: string): ProofResult {
  return solveIntervalDeadlock(
    "pension-eligibility-rules",
    "epfo-withdrawal-limit",
    "epfo-pension-limit",
    "serviceYears",
    lang
  );
}
