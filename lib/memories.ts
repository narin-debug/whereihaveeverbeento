export type Memory = {
  id: string;
  tripId: string;
  photoDataUrl: string;
  caption: string;
  createdAt: string;
};

const STORAGE_KEY = "wanderlog-memories";

export function loadMemories(): Memory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Memory[]) : [];
  } catch {
    return [];
  }
}

export function saveMemories(memories: Memory[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    return true;
  } catch {
    return false;
  }
}
