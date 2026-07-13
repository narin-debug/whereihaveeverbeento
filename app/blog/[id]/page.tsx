"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import {
  fetchPost,
  postPhotoUrl,
  promptAndDeletePost,
  updatePost,
  type Post,
} from "@/lib/posts";
import { translateErrorCode } from "@/lib/i18n";
import { useLocale, useTranslations } from "@/lib/locale-context";

export default function BlogPostPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [passcode, setPasscode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost(id).then(setPost);
  }, [id]);

  const startEditing = () => {
    if (!post) return;
    setTitle(post.title);
    setBody(post.body);
    setPasscode("");
    setError(null);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!post || !title.trim() || !body.trim() || !passcode) return;
    setSaving(true);
    setError(null);

    const result = await updatePost(post.id, { title: title.trim(), body: body.trim() }, passcode);

    setSaving(false);

    if (!result.ok) {
      setError(translateErrorCode(result.error, "errorSaveFailed", t));
      return;
    }

    setPost(result.post);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!post) return;
    if (await promptAndDeletePost(post.id, t)) {
      router.push("/blog");
    }
  };

  if (post === undefined) {
    return (
      <>
        <Nav />
        <section className="mx-auto max-w-2xl px-6 pb-24 pt-32 md:px-12" />
      </>
    );
  }

  if (post === null) {
    return (
      <>
        <Nav />
        <section className="mx-auto max-w-2xl px-6 pb-24 pt-32 text-center md:px-12">
          <p className="text-sm text-muted">{t("errorPostNotFound")}</p>
          <Link href="/blog" className="mt-4 inline-block text-sm text-accent">
            {t("backToList")}
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <Nav />
      <section className="mx-auto max-w-2xl px-6 pb-24 pt-32 md:px-12">
        <Link href="/blog" className="text-xs text-muted transition-colors hover:text-accent">
          ← {t("backToList")}
        </Link>

        {editing ? (
          <div className="mt-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-lg font-bold"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="mt-3 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm leading-relaxed"
            />
            <label className="mt-3 block text-xs font-mono uppercase tracking-wide text-muted">
              {t("passwordLabel")}
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            />
            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!title.trim() || !body.trim() || !passcode || saving}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background disabled:opacity-40"
              >
                {saving ? t("savingEdit") : t("saveEdit")}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full border border-border px-4 py-2 text-sm"
              >
                {t("cancelEdit")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold">{post.title}</h1>
              <div className="flex shrink-0 gap-3 pt-2">
                <button
                  type="button"
                  onClick={startEditing}
                  className="text-xs text-muted transition-colors hover:text-accent"
                >
                  {t("editPost")}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-xs text-muted transition-colors hover:text-accent"
                >
                  {t("deleteAction")}
                </button>
              </div>
            </div>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-muted">
              {new Date(post.createdAt).toLocaleDateString(
                locale === "ko" ? "ko-KR" : "en-US",
                { year: "numeric", month: "long", day: "numeric" },
              )}
              {post.updatedAt !== post.createdAt && ` ${t("editedLabel")}`}
            </p>

            {post.photoIds.length > 0 && (
              <div className="mt-6 flex flex-col gap-4">
                {post.photoIds.map((photoId) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={photoId}
                    src={postPhotoUrl(photoId)}
                    alt={post.title}
                    className="max-h-[70vh] w-full rounded-xl bg-surface object-contain"
                  />
                ))}
              </div>
            )}

            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>
          </>
        )}
      </section>
    </>
  );
}
