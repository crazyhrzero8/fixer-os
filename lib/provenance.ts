import { readFileSync } from "fs";
import path from "path";
import { z } from "zod";
import { appendEvent, CASE_IDS, getCase } from "@/lib/ledger";

const entrySchema = z.object({ patterns: z.array(z.string()), service: z.string(), tier: z.literal("OFFICIAL") });
const registrySchema = z.object({ registry: z.array(entrySchema), sandboxNote: z.string() });

const registry = registrySchema.parse(JSON.parse(readFileSync(path.join(process.cwd(), "playbooks", "trusted-domains.json"), "utf-8")));

export interface ProvenanceVerdict {
  origin: string;
  secure: boolean;
  tier: "OFFICIAL" | "SANDBOX" | "UNKNOWN";
  service: string | null;
  note: string;
}

export async function verifyOrigin(caseId: string, origin: string): Promise<ProvenanceVerdict> {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error("Invalid origin");
  }
  const secure = parsed.protocol === "https:";
  const normalized = `${parsed.protocol}//${parsed.host}`;
  const match = registry.registry.find((entry) => entry.patterns.includes(normalized));
  const tier: ProvenanceVerdict["tier"] = match ? "OFFICIAL" : secure ? "SANDBOX" : "UNKNOWN";

  if (Object.values(CASE_IDS).includes(caseId as never)) {
    const record = await getCase(caseId);
    const hasProv = record?.events.some((e) => e.type === "PROVENANCE_VERIFIED");
    if (!hasProv) {
      await appendEvent(caseId, "system", "PROVENANCE_VERIFIED", {
        origin: normalized,
        secure,
        tier,
        service: match?.service ?? null,
        method: "allowlist match over simulated government manifest"
      });
    }
  }

  return {
    origin: normalized,
    secure,
    tier,
    service: match?.service ?? null,
    note: tier === "OFFICIAL"
      ? `Matches the simulated official manifest for ${match?.service}.`
      : tier === "SANDBOX"
        ? registry.sandboxNote
        : "Insecure origin — no legitimate government service operates over plain HTTP."
  };
}
