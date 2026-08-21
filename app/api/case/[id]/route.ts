import { NextResponse } from "next/server";
import { z } from "zod";
import { CASE_IDS, getCase, resetCase, verifyLedger } from "@/lib/ledger";

const idSchema = z.enum([CASE_IDS.epfo, CASE_IDS.irctc]);

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  const caseRecord = getCase(id);
  if (!caseRecord) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json({ case: caseRecord, verification: verifyLedger(caseRecord) });
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  const caseRecord = resetCase(parsed.data);
  if (!caseRecord) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json({ case: caseRecord, verification: verifyLedger(caseRecord) });
}
