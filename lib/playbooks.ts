import { z } from "zod";

const preconditionSchema = z.object({
  op: z.enum(["eq", "neq", "truthy", "notInRange", "lt", "lte", "gt", "gte"]),
  left: z.string(),
  right: z.unknown().optional(),
  range: z.tuple([z.number(), z.number()]).optional()
});

const stepSchema = z.object({
  marker: z.string().min(3),
  action: z.enum(["INTERPRET_STATE", "DRAFT_REBUTTAL", "FILE_APPEAL", "CHECK_SLA", "ESCALATE"]),
  event: z.object({ actor: z.enum(["citizen", "portal", "agent", "system"]), type: z.string().min(3), payload: z.record(z.unknown()) }),
  summary: z.string(),
  detail: z.string(),
  preconditions: z.array(preconditionSchema).optional(),
  complete: z.object({
    status: z.literal("RESOLVED"),
    systemEvent: z.object({ type: z.string().min(3), payload: z.record(z.unknown()) })
  }).optional()
});

export const playbookSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  kind: z.string(),
  title: z.string(),
  context: z.record(z.union([z.string(), z.number(), z.boolean()])),
  steps: z.array(stepSchema).min(3)
});

export type Playbook = z.infer<typeof playbookSchema>;
export type PlaybookStep = z.infer<typeof stepSchema>;

function lookup(source: Record<string, unknown>, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), source);
  return value === undefined || value === null ? "" : typeof value === "number" ? value.toLocaleString("en-IN") : String(value);
}

export function renderTemplate(template: string, ctx: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path: string) => lookup(ctx, path.trim()));
}

export function renderDeep<T>(node: T, ctx: Record<string, unknown>): T {
  if (typeof node === "string") return renderTemplate(node, ctx) as unknown as T;
  if (Array.isArray(node)) return node.map((item) => renderDeep(item, ctx)) as unknown as T;
  if (node && typeof node === "object") {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, renderDeep(v, ctx)])) as unknown as T;
  }
  return node;
}
