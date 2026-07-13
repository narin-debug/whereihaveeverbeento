import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getClientIp, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";

async function ensureTables() {
  // posts.memory_id references this table, so it must exist first -- safe
  // to repeat here even though /api/memories also creates it.
  await sql`
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      country TEXT NOT NULL,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      photo_data_url TEXT NOT NULL,
      caption TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`ALTER TABLE memories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      memory_id TEXT REFERENCES memories(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // Existing deployments already have a posts table from before memory_id
  // existed -- add it retroactively rather than requiring a manual migration.
  await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS memory_id TEXT REFERENCES memories(id) ON DELETE SET NULL`;
  await sql`
    CREATE TABLE IF NOT EXISTS post_photos (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      photo_data_url TEXT NOT NULL,
      position INTEGER NOT NULL
    )
  `;
}

// Same reasoning as /api/memories: photos are served individually (see
// photos/[photoId]/route.ts) so this list stays well under Vercel's 4.5MB
// response cap regardless of how many posts or photos accumulate.
export async function GET() {
  await ensureTables();
  const { rows: posts } = await sql`
    SELECT id, title, body, memory_id AS "memoryId", created_at AS "createdAt", updated_at AS "updatedAt"
    FROM posts
    ORDER BY created_at DESC
  `;
  const { rows: photos } = await sql`
    SELECT id, post_id AS "postId" FROM post_photos ORDER BY post_id, position ASC
  `;

  const photosByPost = new Map<string, string[]>();
  for (const p of photos) {
    const list = photosByPost.get(p.postId) ?? [];
    list.push(p.id);
    photosByPost.set(p.postId, list);
  }

  const result = posts.map((post) => ({
    ...post,
    photoIds: photosByPost.get(post.id) ?? [],
  }));

  return NextResponse.json(result);
}

const MAX_PHOTO_DATA_URL_LENGTH = 4_500_000; // ~4.5MB as base64 text

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (await isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const { passcode, title, body: postBody, photos, memoryId } = body ?? {};

  if (passcode !== process.env.OWNER_PASSCODE) {
    await recordFailedAttempt(ip);
    return NextResponse.json({ error: "invalid_passcode" }, { status: 401 });
  }
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof postBody !== "string" ||
    !postBody.trim() ||
    !Array.isArray(photos) ||
    (memoryId !== undefined && memoryId !== null && typeof memoryId !== "string")
  ) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  for (const p of photos) {
    if (typeof p !== "string" || p.length > MAX_PHOTO_DATA_URL_LENGTH) {
      return NextResponse.json({ error: "photo_too_large" }, { status: 413 });
    }
  }

  await ensureTables();
  const postId = crypto.randomUUID();
  await sql`
    INSERT INTO posts (id, title, body, memory_id)
    VALUES (${postId}, ${title.trim()}, ${postBody.trim()}, ${memoryId ?? null})
  `;

  const photoIds: string[] = [];
  for (let i = 0; i < photos.length; i++) {
    const photoId = crypto.randomUUID();
    await sql`
      INSERT INTO post_photos (id, post_id, photo_data_url, position)
      VALUES (${photoId}, ${postId}, ${photos[i]}, ${i})
    `;
    photoIds.push(photoId);
  }

  const { rows } = await sql`
    SELECT id, title, body, memory_id AS "memoryId", created_at AS "createdAt", updated_at AS "updatedAt"
    FROM posts WHERE id = ${postId}
  `;

  return NextResponse.json({ ...rows[0], photoIds }, { status: 201 });
}
