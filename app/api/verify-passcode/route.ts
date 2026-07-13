import { NextResponse } from "next/server";
import { getClientIp, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";

// Read-only check used to gate owner-only UI (e.g. the backup export) that
// doesn't otherwise call a passcode-protected write endpoint.
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (await isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const passcode = body?.passcode;

  if (passcode !== process.env.OWNER_PASSCODE) {
    await recordFailedAttempt(ip);
    return NextResponse.json({ error: "invalid_passcode" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
