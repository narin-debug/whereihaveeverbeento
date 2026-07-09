import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getClientIp, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      country TEXT NOT NULL,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      photo_data_url TEXT NOT NULL,
      caption TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

// Photos are served separately (see [id]/photo/route.ts) so this response
// stays small no matter how many memories accumulate — Vercel serverless
// functions cap request/response bodies at 4.5MB, and a list that embeds
// every photo inline will eventually blow past that and 413 for everyone.
export async function GET() {
  await ensureTable();
  const { rows } = await sql`
    SELECT id, country, lat, lng, caption, created_at AS "createdAt"
    FROM memories
    ORDER BY created_at ASC
  `;
  return NextResponse.json(rows);
}

const MAX_PHOTO_DATA_URL_LENGTH = 4_500_000; // ~4.5MB as base64 text

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (await isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const { passcode, country, lat, lng, photoDataUrl, caption } = body ?? {};

  if (passcode !== process.env.OWNER_PASSCODE) {
    await recordFailedAttempt(ip);
    return NextResponse.json({ error: "invalid_passcode" }, { status: 401 });
  }
  if (
    typeof country !== "string" ||
    !country ||
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    typeof photoDataUrl !== "string" ||
    !photoDataUrl ||
    typeof caption !== "string" ||
    !caption
  ) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (photoDataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
    return NextResponse.json({ error: "photo_too_large" }, { status: 413 });
  }

  await ensureTable();
  const id = crypto.randomUUID();
  const { rows } = await sql`
    INSERT INTO memories (id, country, lat, lng, photo_data_url, caption)
    VALUES (${id}, ${country}, ${lat}, ${lng}, ${photoDataUrl}, ${caption})
    RETURNING id, country, lat, lng, caption, created_at AS "createdAt"
  `;

  return NextResponse.json(rows[0], { status: 201 });
}
