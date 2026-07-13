export async function verifyPasscode(
  passcode: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/verify-passcode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passcode }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, error: body?.error ?? "invalid_passcode" };
  }

  return { ok: true };
}
