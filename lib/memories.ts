export type Memory = {
  id: string;
  country: string;
  lat: number;
  lng: number;
  photoDataUrl: string;
  caption: string;
  createdAt: string;
};

export type NewMemory = {
  country: string;
  lat: number;
  lng: number;
  photoDataUrl: string;
  caption: string;
};

export async function fetchMemories(): Promise<Memory[]> {
  const res = await fetch("/api/memories", { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as Memory[];
}

export async function createMemory(
  memory: NewMemory,
  passcode: string,
): Promise<{ ok: true; memory: Memory } | { ok: false; error: string }> {
  const res = await fetch("/api/memories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...memory, passcode }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, error: body?.error ?? "기록을 저장하지 못했어요." };
  }

  return { ok: true, memory: await res.json() };
}
