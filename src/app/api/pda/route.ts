import { NextRequest, NextResponse } from "next/server";
import { getPdaPayload } from "@/lib/pda/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payload = await getPdaPayload(searchParams.get("since"), searchParams.get("until"));
    return NextResponse.json(payload, { headers: { "Cache-Control": "private, max-age=0, no-store" } });
  } catch {
    return NextResponse.json({ error: "PDA matrix data is temporarily unavailable." }, { status: 503 });
  }
}
