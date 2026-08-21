import { NextResponse } from "next/server";
import { listCases } from "@/lib/ledger";

export async function GET() {
  return NextResponse.json({ cases: listCases() });
}
