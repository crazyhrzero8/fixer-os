import { NextResponse } from "next/server";
import { escalationLetter, traceSummary } from "@/lib/traceroute";
export async function GET() { return NextResponse.json({ ...traceSummary(), escalationLetter: escalationLetter() }); }
