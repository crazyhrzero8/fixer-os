import { NextResponse } from "next/server";
import { provePensionDeadlock } from "@/lib/prover";
export async function GET() { return NextResponse.json(provePensionDeadlock()); }
