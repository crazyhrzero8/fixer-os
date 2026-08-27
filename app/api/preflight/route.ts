import { NextResponse } from "next/server";
import { CASE_IDS } from "@/lib/ledger";
import { runPreflight } from "@/lib/preflight";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = url.searchParams.get("case");
  const caseId = requested === CASE_IDS.irctc ? CASE_IDS.irctc : requested === CASE_IDS.epfo ? CASE_IDS.epfo : null;
  if (!caseId) return NextResponse.json({ error: "Invalid caseId." }, { status: 400 });
  return NextResponse.json({ caseId, results: await runPreflight(caseId) });
}
