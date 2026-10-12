import { NextResponse } from "next/server";
import { getDashboardPayload } from "@/lib/dashboard/service";

export const runtime = "nodejs";

export async function GET() {
  const payload = await getDashboardPayload();
  return NextResponse.json(payload, { headers: { "Cache-Control": "private, max-age=60" } });
}
