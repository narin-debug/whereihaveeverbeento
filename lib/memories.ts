export type Memory = {
  id: string;
  country: string;
  lat: number;
  lng: number;
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

// Photos are served from their own endpoint instead of being embedded in the
// list/create responses, so a growing number of memories never inflates
// those payloads past Vercel's 4.5MB serverless response limit.
export function memoryPhotoUrl(id: string): string {
  return `/api/memories/${id}/photo`;
}

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
    return { ok: false, error: body?.error ?? "save_failed" };
  }

  return { ok: true, memory: await res.json() };
}

export async function deleteMemory(
  id: string,
  passcode: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`/api/memories/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passcode }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, error: body?.error ?? "delete_failed" };
  }

  return { ok: true };
}
