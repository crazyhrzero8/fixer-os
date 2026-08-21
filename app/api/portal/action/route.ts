import { NextResponse } from "next/server";
import { initialPortalSnapshot, transitionPortal, type PortalAction, type PortalSnapshot } from "@/lib/portalFsm";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { action?: PortalAction; snapshot?: PortalSnapshot };
    if (!body.action) return NextResponse.json({ error: "An action is required." }, { status: 400 });
    return NextResponse.json({ snapshot: transitionPortal(body.snapshot ?? initialPortalSnapshot(), body.action) });
  } catch {
    return NextResponse.json({ error: "Invalid portal action payload." }, { status: 400 });
  }
}
