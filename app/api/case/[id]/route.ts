import { NextResponse } from "next/server";
import { z } from "zod";
import { CASE_IDS, getCase, resetCase, verifyLedger, appendEvent } from "@/lib/ledger";
import { getCaseNotifications } from "@/lib/scheduler";
import { generateRtiDraft } from "@/lib/rti";

const idSchema = z.enum(["synthetic-epfo-001", "synthetic-irctc-001", "ramu-epfo-001", "radhika-irctc-001"]);

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  const caseRecord = await getCase(id);
  if (!caseRecord) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json({
    case: caseRecord,
    verification: verifyLedger(caseRecord),
    alerts: getCaseNotifications(caseRecord),
    rtiDraft: generateRtiDraft(caseRecord)
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  
  const body = await request.json().catch(() => null);
  if (body?.action === "ATTACH") {
    const { fileName, fileHash, fileType } = body;
    const evt = await appendEvent(parsed.data, "citizen", "DOCUMENT_ATTACHED", { fileName, fileHash, fileType });
    const record = await getCase(parsed.data);
    return NextResponse.json({
      case: record,
      verification: record ? verifyLedger(record) : null,
      event: evt,
      alerts: record ? getCaseNotifications(record) : [],
      rtiDraft: record ? generateRtiDraft(record) : ""
    });
  }

  const caseRecord = await resetCase(parsed.data);
  if (!caseRecord) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json({
    case: caseRecord,
    verification: verifyLedger(caseRecord),
    alerts: getCaseNotifications(caseRecord),
    rtiDraft: generateRtiDraft(caseRecord)
  });
}
