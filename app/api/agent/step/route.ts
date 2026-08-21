import { NextResponse } from "next/server";
import { nextAgentStep } from "@/lib/agent";
import { getCase, verifyLedger } from "@/lib/ledger";

export async function POST() {
  const result = await nextAgentStep();
  const caseRecord = getCase();
  return NextResponse.json({ result, case: caseRecord, verification: caseRecord ? verifyLedger(caseRecord) : null });
}
