import { NextResponse } from "next/server";
import { CASE_IDS, getCase } from "@/lib/ledger";
import { escalationLetter, traceSummary } from "@/lib/traceroute";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = url.searchParams.get("case") || CASE_IDS.epfo;
  const record = await getCase(requested);
  const facts = record?.facts;
  return NextResponse.json({ ...traceSummary(requested, Date.now(), facts), escalationLetter: escalationLetter(requested, facts), caseId: requested });
}
