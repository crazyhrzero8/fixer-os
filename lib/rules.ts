import { readFileSync } from "fs";
import path from "path";
import { z } from "zod";

export const ruleSchema = z.object({
  id: z.string(),
  test: z.object({
    op: z.enum(["eq", "neq", "truthy", "notInRange", "lt", "lte", "gt", "gte"]),
    left: z.string(),
    right: z.unknown().optional(),
    range: z.tuple([z.number(), z.number()]).optional()
  }),
  failStatus: z.enum(["FAIL", "WARN"]),
  message: z.string(),
  fix: z.string().optional()
});

const registrySchema = z.record(z.object({ rules: z.array(ruleSchema) }));

export interface RuleResult {
  ruleId: string;
  status: "PASS" | "FAIL" | "WARN";
  message: string;
  fix: string;
}

export function lookupValue(ctx: Record<string, unknown>, template: unknown): unknown {
  if (typeof template !== "string") return template;
  const match = /^\{\{(.+)\}\}$/.exec(template.trim());
  if (!match) return template;
  return match[1].trim().split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), ctx);
}

export function evaluateRule(rule: z.infer<typeof ruleSchema>, ctx: Record<string, unknown>): RuleResult {
  const left = lookupValue(ctx, rule.test.left);
  
  let passed: boolean;
  switch (rule.test.op) {
    case "eq": {
      const right = lookupValue(ctx, rule.test.right);
      passed = left === right;
      break;
    }
    case "neq": {
      const right = lookupValue(ctx, rule.test.right);
      passed = left !== right;
      break;
    }
    case "truthy": {
      passed = Boolean(left);
      break;
    }
    case "notInRange": {
      const n = Number(left);
      const [lo, hi] = rule.test.range ?? [0, 0];
      passed = !(n >= lo && n < hi);
      break;
    }
    case "lt": {
      const right = typeof rule.test.right === "number" ? rule.test.right : Number(lookupValue(ctx, rule.test.right));
      passed = Number(left) < right;
      break;
    }
    case "lte": {
      const right = typeof rule.test.right === "number" ? rule.test.right : Number(lookupValue(ctx, rule.test.right));
      passed = Number(left) <= right;
      break;
    }
    case "gt": {
      const right = typeof rule.test.right === "number" ? rule.test.right : Number(lookupValue(ctx, rule.test.right));
      passed = Number(left) > right;
      break;
    }
    case "gte": {
      const right = typeof rule.test.right === "number" ? rule.test.right : Number(lookupValue(ctx, rule.test.right));
      passed = Number(left) >= right;
      break;
    }
    default:
      passed = false;
  }
  return {
    ruleId: rule.id,
    status: passed ? "PASS" : rule.failStatus,
    message: rule.message,
    fix: passed ? "" : (rule.fix ?? "")
  };
}

export function getUnifiedRules(): Record<string, { rules: z.infer<typeof ruleSchema>[] }> {
  const filepath = path.join(process.cwd(), "playbooks", "unified-rules.json");
  return registrySchema.parse(JSON.parse(readFileSync(filepath, "utf-8")));
}

export function getRuleFromRegistry(group: string, ruleId: string): z.infer<typeof ruleSchema> | null {
  const registry = getUnifiedRules();
  const list = registry[group]?.rules || [];
  return list.find((r) => r.id === ruleId) || null;
}
