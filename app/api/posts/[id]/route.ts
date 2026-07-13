import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getClientIp, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { rows } = await sql`
    SELECT id, title, body, memory_id AS "memoryId", created_at AS "createdAt", updated_at AS "updatedAt"
    FROM posts WHERE id = ${id}
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { rows: photos } = await sql`
    SELECT id FROM post_photos WHERE post_id = ${id} ORDER BY position ASC
  `;

  return NextResponse.json({ ...rows[0], photoIds: photos.map((p) => p.id) });
}

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
  const { passcode, title, body: postBody } = body ?? {};

  if (passcode !== process.env.OWNER_PASSCODE) {
    await recordFailedAttempt(ip);
    return NextResponse.json({ error: "invalid_passcode" }, { status: 401 });
  }
  if (typeof title !== "string" || !title.trim() || typeof postBody !== "string" || !postBody.trim()) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { rows } = await sql`
    UPDATE posts SET title = ${title.trim()}, body = ${postBody.trim()}, updated_at = now()
    WHERE id = ${id}
    RETURNING id, title, body, memory_id AS "memoryId", created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { rows: photos } = await sql`
    SELECT id FROM post_photos WHERE post_id = ${id} ORDER BY position ASC
  `;

  return NextResponse.json({ ...rows[0], photoIds: photos.map((p) => p.id) });
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

  const { rowCount } = await sql`DELETE FROM posts WHERE id = ${id}`;
  if (rowCount === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
