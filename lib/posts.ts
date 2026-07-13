import { translateErrorCode, type TranslationKey } from "./i18n";

export type Post = {
  id: string;
  title: string;
  body: string;
  memoryId: string | null;
  createdAt: string;
  updatedAt: string;
  photoIds: string[];
};

export type NewPost = {
  title: string;
  body: string;
  photos: string[]; // compressed data URLs
  memoryId?: string | null;
};

// Mirrors memoryPhotoUrl: photos are served individually rather than
// embedded in list/detail responses, so those stay small regardless of how
// many posts or photos accumulate.
export function postPhotoUrl(photoId: string): string {
  return `/api/posts/photos/${photoId}`;
}

export async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("/api/posts", { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as Post[];
}

export async function fetchPost(id: string): Promise<Post | null> {
  const res = await fetch(`/api/posts/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as Post;
}

export async function createPost(
  post: NewPost,
  passcode: string,
): Promise<{ ok: true; post: Post } | { ok: false; error: string }> {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...post, passcode }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, error: body?.error ?? "save_failed" };
  }

  return { ok: true, post: await res.json() };
}

export async function updatePost(
  id: string,
  updates: { title: string; body: string },
  passcode: string,
): Promise<{ ok: true; post: Post } | { ok: false; error: string }> {
  const res = await fetch(`/api/posts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...updates, passcode }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, error: body?.error ?? "save_failed" };
  }

  return { ok: true, post: await res.json() };
}

export async function deletePost(
  id: string,
  passcode: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`/api/posts/${id}`, {
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

export async function promptAndDeletePost(
  id: string,
  t: (key: TranslationKey) => string,
): Promise<boolean> {
  const passcode = window.prompt(t("deletePrompt"));
  if (!passcode) return false;
  const result = await deletePost(id, passcode);
  if (!result.ok) {
    window.alert(translateErrorCode(result.error, "errorDeleteFailed", t));
    return false;
  }
  return true;
}
