import crypto from "crypto";
import type { CaseRecord } from "./ledger";

export type BundleManifest = {
  bundleId: string;
  ruleId: string;
  officeId: string;
  members: string[];
  manifestHash: string;
  createdAt: string;
};

export function findClassBundleFromRecord(target: CaseRecord, allCases: CaseRecord[]): BundleManifest | null {
  if (!target) return null;

  const ruleId = target.kind;
  const officeId = "OFFICE-001";

  const members = allCases
    .filter(c => c.id !== target.id && c.kind === ruleId && c.status !== "RESOLVED")
    .map(c => c.id);

  if (members.length === 0) return null;

  const allIds = [target.id, ...members].sort();
  const payload = JSON.stringify({ ruleId, officeId, members: allIds });
  const manifestHash = crypto.createHash("sha256").update(payload).digest("hex");
  const bundleId = `BUNDLE-${manifestHash.slice(0,12)}`;

  return {
    bundleId,
    ruleId,
    officeId,
    members: allIds,
    manifestHash,
    createdAt: new Date().toISOString()
  };
}
