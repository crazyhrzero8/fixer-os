import { NextResponse } from "next/server";
import { getCase, resetCase, verifyLedger } from "@/lib/ledger";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseRecord = getCase(id);
  if (!caseRecord) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json({ case: caseRecord, verification: verifyLedger(caseRecord) });
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getCase(id)) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  const caseRecord = resetCase();
  return NextResponse.json({ case: caseRecord, verification: verifyLedger(caseRecord) });
}
