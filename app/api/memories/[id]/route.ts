import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getClientIp, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";

const MAX_PHOTO_DATA_URL_LENGTH = 4_500_000; // ~4.5MB as base64 text

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const ip = getClientIp(request);
  if (await isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const { passcode, photoDataUrl } = body ?? {};

  if (passcode !== process.env.OWNER_PASSCODE) {
    await recordFailedAttempt(ip);
    return NextResponse.json({ error: "invalid_passcode" }, { status: 401 });
  }
  if (typeof photoDataUrl !== "string" || !photoDataUrl) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (photoDataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
    return NextResponse.json({ error: "photo_too_large" }, { status: 413 });
  }

  const { rows } = await sql`
    UPDATE memories SET photo_data_url = ${photoDataUrl}, updated_at = now()
    WHERE id = ${id}
    RETURNING id, country, lat, lng, caption, created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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

  const { rowCount } = await sql`DELETE FROM memories WHERE id = ${id}`;
  if (rowCount === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
