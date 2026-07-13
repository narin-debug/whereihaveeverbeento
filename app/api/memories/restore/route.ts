import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getClientIp, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";

const MAX_PHOTO_DATA_URL_LENGTH = 4_500_000; // ~4.5MB as base64 text

// Re-inserts a single memory from a backup export, preserving its original
// id/createdAt/updatedAt (unlike POST /api/memories, which always mints a
// fresh id and "now" timestamps for a genuinely new entry). ON CONFLICT DO
// NOTHING makes this purely additive -- restoring never overwrites or
// duplicates a memory that's already there.
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (await isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const { passcode, id, country, lat, lng, caption, photoDataUrl, createdAt, updatedAt } = body ?? {};

  if (passcode !== process.env.OWNER_PASSCODE) {
    await recordFailedAttempt(ip);
    return NextResponse.json({ error: "invalid_passcode" }, { status: 401 });
  }
  if (
    typeof id !== "string" ||
    !id ||
    typeof country !== "string" ||
    !country ||
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    typeof caption !== "string" ||
    !caption ||
    typeof photoDataUrl !== "string" ||
    !photoDataUrl ||
    typeof createdAt !== "string" ||
    !createdAt ||
    typeof updatedAt !== "string" ||
    !updatedAt
  ) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (photoDataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
    return NextResponse.json({ error: "photo_too_large" }, { status: 413 });
  }

  const { rowCount } = await sql`
    INSERT INTO memories (id, country, lat, lng, photo_data_url, caption, created_at, updated_at)
    VALUES (${id}, ${country}, ${lat}, ${lng}, ${photoDataUrl}, ${caption}, ${createdAt}, ${updatedAt})
    ON CONFLICT (id) DO NOTHING
  `;

  return NextResponse.json({ restored: (rowCount ?? 0) > 0 });
}
