import { sql } from "@vercel/postgres";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ photoId: string }> },
) {
  const { photoId } = await params;
  const { rows } = await sql`SELECT photo_data_url FROM post_photos WHERE id = ${photoId}`;
  const dataUrl = rows[0]?.photo_data_url as string | undefined;

  if (!dataUrl) {
    return new Response("Not found", { status: 404 });
  }

  const match = /^data:(.+);base64,(.*)$/.exec(dataUrl);
  if (!match) {
    return new Response("Corrupt photo data", { status: 500 });
  }

  const [, contentType, base64] = match;
  const bytes = Buffer.from(base64, "base64");

  return new Response(bytes, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
