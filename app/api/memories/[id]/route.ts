import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const passcode = body?.passcode;

  if (passcode !== process.env.OWNER_PASSCODE) {
    return NextResponse.json({ error: "invalid_passcode" }, { status: 401 });
  }

  const { rowCount } = await sql`DELETE FROM memories WHERE id = ${id}`;
  if (rowCount === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
