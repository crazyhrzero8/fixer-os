import { NextResponse } from "next/server";
import { z } from "zod";
import { CASE_IDS, getCase, verifyLedger } from "@/lib/ledger";
import { nextAgentStep } from "@/lib/agent";
import { clientKey, rateLimit } from "@/lib/ratelimit";

const bodySchema = z.object({ caseId: z.enum([CASE_IDS.epfo, CASE_IDS.irctc]) });

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "agent"));
  if (!limit.allowed) return NextResponse.json({ error: `Too many requests. Retry in ${limit.retryAfterSeconds}s.` }, { status: 429 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid caseId." }, { status: 400 });

  const result = await nextAgentStep(parsed.data.caseId);
  const caseRecord = await getCase(parsed.data.caseId);
  return NextResponse.json({ result, case: caseRecord, verification: caseRecord ? verifyLedger(caseRecord) : null });
}
