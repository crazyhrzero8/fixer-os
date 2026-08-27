import { NextResponse } from "next/server";
import { z } from "zod";
import { CASE_IDS } from "@/lib/ledger";
import { verifyOrigin } from "@/lib/provenance";
import { clientKey, rateLimit } from "@/lib/ratelimit";

const bodySchema = z.object({
  caseId: z.enum([CASE_IDS.epfo, CASE_IDS.irctc]),
  origin: z.string().url().max(200)
});

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "provenance"));
  if (!limit.allowed) return NextResponse.json({ error: `Too many requests. Retry in ${limit.retryAfterSeconds}s.` }, { status: 429 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  try {
    return NextResponse.json({ verdict: await verifyOrigin(parsed.data.caseId, parsed.data.origin) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Verification failed" }, { status: 400 });
  }
}
