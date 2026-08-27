import { readFileSync } from "fs";
import path from "path";
import { z } from "zod";
import { getCase } from "@/lib/ledger";

const ruleSchema = z.object({
  id: z.string(),
  test: z.object({
    op: z.enum(["eq", "neq", "truthy", "notInRange"]),
    left: z.string(),
    right: z.unknown().optional(),
    range: z.tuple([z.number(), z.number()]).optional()
  }),
  failStatus: z.enum(["FAIL", "WARN"]),
  message: z.string(),
  fix: z.string()
});

const registrySchema = z.record(z.object({ rules: z.array(ruleSchema) }));

export interface PreflightResult { ruleId: string; status: "PASS" | "FAIL" | "WARN"; message: string; fix: string; }

function lookup(ctx: Record<string, unknown>, template: string): unknown {
  const match = /^\{\{(.+)\}\}$/.exec(template.trim());
  if (!match) return template;
  return match[1].trim().split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), ctx);
}

function evaluate(rule: z.infer<typeof ruleSchema>, ctx: Record<string, unknown>): PreflightResult {
  const left = lookup(ctx, rule.test.left);
  const right = lookup(ctx, String(rule.test.right ?? ""));
  let passed: boolean;
  switch (rule.test.op) {
    case "eq": passed = left === right; break;
    case "neq": passed = left !== right; break;
    case "truthy": passed = Boolean(left); break;
    case "notInRange": {
      const n = Number(left);
      const [lo, hi] = rule.test.range ?? [0, 0];
      passed = !(n >= lo && n < hi);
      break;
    }
  }
  return { ruleId: rule.id, status: passed ? "PASS" : rule.failStatus, message: rule.message, fix: passed ? "" : rule.fix };
}

const registry = registrySchema.parse(JSON.parse(readFileSync(path.join(process.cwd(), "playbooks", "preflight-rules.json"), "utf-8")));

export async function runPreflight(caseId: string): Promise<PreflightResult[]> {
  const record = await getCase(caseId);
  if (!record || !registry[record.kind]) return [];
  const ctx = { facts: record.facts };
  return registry[record.kind].rules.map((rule) => evaluate(rule, ctx));
}
