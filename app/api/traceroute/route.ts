import { NextResponse } from "next/server";
import { CASE_IDS } from "@/lib/ledger";
import { escalationLetter, traceSummary } from "@/lib/traceroute";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = url.searchParams.get("case");
  const caseId = requested === CASE_IDS.irctc ? CASE_IDS.irctc : CASE_IDS.epfo;
  return NextResponse.json({ ...traceSummary(caseId), escalationLetter: escalationLetter(caseId), caseId });
}
