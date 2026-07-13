"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPost, type Post } from "@/lib/posts";
import { fetchMemories, type Memory } from "@/lib/memories";
import { compressImage } from "@/lib/images";
import { translateErrorCode } from "@/lib/i18n";
import { useTranslations } from "@/lib/locale-context";

export default function PostForm({ onAdded }: { onAdded: (post: Post) => void }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [memoryId, setMemoryId] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [passcode, setPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMemories().then(setMemories);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setPhotos([]);
    setMemoryId("");
    setPasscode("");
    setError(null);
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const compressed = await Promise.all([...files].map(compressImage));
      setPhotos((prev) => [...prev, ...compressed]);
    } catch {
      setError(t("errorPhotoProcessing"));
    }
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !passcode) return;

    setSubmitting(true);
    setError(null);

    const result = await createPost(
      { title: title.trim(), body: body.trim(), photos, memoryId: memoryId || null },
      passcode,
    );

    setSubmitting(false);

    if (!result.ok) {
      setError(translateErrorCode(result.error, "errorSaveFailed", t));
      return;
    }

    onAdded(result.post);
    resetForm();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent"
      >
        {t("writePost")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{t("postFormTitle")}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="text-muted transition-colors hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <label className="mt-5 block text-xs font-mono uppercase tracking-wide text-muted">
              {t("postTitleLabel")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("postTitlePlaceholder")}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />

            <label className="mt-4 block text-xs font-mono uppercase tracking-wide text-muted">
              {t("postBodyLabel")}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("postBodyPlaceholder")}
              rows={8}
              className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />

            <label className="mt-4 block text-xs font-mono uppercase tracking-wide text-muted">
              {t("postPhotosLabel")}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              className="mt-2 w-full text-sm"
            />
            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt=""
                      className="h-20 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label={t("removePhoto")}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="mt-4 block text-xs font-mono uppercase tracking-wide text-muted">
              {t("linkMemoryLabel")}
            </label>
            <select
              value={memoryId}
              onChange={(e) => setMemoryId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">{t("noneOption")}</option>
              {memories.map((memory) => (
                <option key={memory.id} value={memory.id}>
                  {memory.country} · {memory.caption}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-xs font-mono uppercase tracking-wide text-muted">
              {t("passwordLabel")}
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />

            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={!title.trim() || !body.trim() || !passcode || submitting}
              className="mt-5 w-full rounded-full bg-accent py-2 text-sm font-semibold text-background disabled:opacity-40"
            >
              {submitting ? t("publishing") : t("publishPost")}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
