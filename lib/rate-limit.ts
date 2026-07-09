import { sql } from "@vercel/postgres";

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 1;

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS passcode_attempts (
      id SERIAL PRIMARY KEY,
      ip TEXT NOT NULL,
      attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function isRateLimited(ip: string): Promise<boolean> {
  await ensureTable();
  const { rows } = await sql`
    SELECT count(*) AS count FROM passcode_attempts
    WHERE ip = ${ip} AND attempted_at > now() - (${WINDOW_MINUTES} * interval '1 minute')
  `;
  return Number(rows[0].count) >= MAX_ATTEMPTS;
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  await ensureTable();
  await sql`INSERT INTO passcode_attempts (ip) VALUES (${ip})`;
  // Opportunistic cleanup so this table doesn't grow forever.
  await sql`DELETE FROM passcode_attempts WHERE attempted_at < now() - interval '1 day'`;
}
