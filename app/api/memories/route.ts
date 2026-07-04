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

export async function GET() {
  await ensureTable();
  const { rows } = await sql`
    SELECT id, country, lat, lng, photo_data_url AS "photoDataUrl", caption,
           created_at AS "createdAt"
    FROM memories
    ORDER BY created_at ASC
  `;
  return NextResponse.json(rows);
}

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

  await ensureTable();
  const id = crypto.randomUUID();
  const { rows } = await sql`
    INSERT INTO memories (id, country, lat, lng, photo_data_url, caption)
    VALUES (${id}, ${country}, ${lat}, ${lng}, ${photoDataUrl}, ${caption})
    RETURNING id, country, lat, lng, photo_data_url AS "photoDataUrl", caption,
              created_at AS "createdAt"
  `;

  return NextResponse.json(rows[0], { status: 201 });
}
