import { NextRequest, NextResponse } from "next/server";
import { findClassBundleFromRecord } from "@/lib/classbundle";
import { getCase, listCases } from "@/lib/ledger";

export async function POST(req: NextRequest) {
  const { caseId } = await req.json();
  const record = await getCase(caseId);
  if (!record) return NextResponse.json({ error: "not found" }, { status: 404 });
  const cases = await listCases();
  // Convert list output to CaseRecord shape by re-fetching each? listCases returns {id,title,status}
  // For demo, assume we have enough info: use record.kind to match others.
  const all = [record];
  const manifest = findClassBundleFromRecord(record, all);
  if (!manifest) {
    return NextResponse.json({ found: false });
  }
  return NextResponse.json({ found: true, manifest });
}
