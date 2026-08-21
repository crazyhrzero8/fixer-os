export const FIXER_VERSION = "0.1.0";

export type AgentAction =
  | "INTERPRET_STATE"
  | "PLAN_NEXT"
  | "DRAFT_REBUTTAL"
  | "FILE_APPEAL"
  | "CHECK_SLA"
  | "ESCALATE"
  | "WAIT";

export interface AgentStep {
  action: AgentAction;
  args: Record<string, unknown>;
}
