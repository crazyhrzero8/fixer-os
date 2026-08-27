import { NextResponse } from "next/server";
import { provePensionDeadlock } from "@/lib/prover";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang") === "hi" ? "hi" : "en";
  return NextResponse.json(provePensionDeadlock(lang));
}
