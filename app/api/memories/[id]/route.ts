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
    return NextResponse.json({ error: "비밀번호가 올바르지 않아요." }, { status: 401 });
  }

  const { rowCount } = await sql`DELETE FROM memories WHERE id = ${id}`;
  if (rowCount === 0) {
    return NextResponse.json({ error: "기록을 찾을 수 없어요." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
