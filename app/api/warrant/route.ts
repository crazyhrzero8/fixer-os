import { NextRequest, NextResponse } from "next/server";
import { generateProspectiveWarrantFromRecord } from "@/lib/warrant";
import { getCase } from "@/lib/ledger";

export async function POST(req: NextRequest) {
  const { caseId, lang } = await req.json();
  const record = await getCase(caseId);
  if (!record) return NextResponse.json({ error: "not found" }, { status: 404 });
  const out = generateProspectiveWarrantFromRecord(record, lang || "en");
  return NextResponse.json(out);
}
