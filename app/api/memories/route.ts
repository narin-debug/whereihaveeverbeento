import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

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
  const body = await request.json().catch(() => null);
  const { passcode, country, lat, lng, photoDataUrl, caption } = body ?? {};

  if (passcode !== process.env.OWNER_PASSCODE) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않아요." }, { status: 401 });
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
    return NextResponse.json({ error: "필수 항목이 누락됐어요." }, { status: 400 });
  }
  if (photoDataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
    return NextResponse.json({ error: "사진이 너무 커요. 더 작은 사진으로 시도해주세요." }, { status: 413 });
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
