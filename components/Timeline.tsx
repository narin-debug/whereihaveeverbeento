"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  memoryPhotoUrl,
  promptAndDelete,
  updateMemoryPhoto,
  type Memory,
} from "@/lib/memories";
import { fetchPosts } from "@/lib/posts";
import { compressImage } from "@/lib/images";
import { countries } from "@/data/countries";
import type { ContinentKey } from "@/data/continents";
import { useLocale, useTranslations } from "@/lib/locale-context";
import { translateErrorCode, type TranslationKey } from "@/lib/i18n";

const CONTINENT_ORDER: (ContinentKey | "other")[] = [
  "asia",
  "europe",
  "northAmerica",
  "southAmerica",
  "africa",
  "oceania",
  "antarctica",
  "other",
];

const CONTINENT_LABEL_KEYS: Record<ContinentKey | "other", TranslationKey> = {
  asia: "continentAsia",
  europe: "continentEurope",
  africa: "continentAfrica",
  northAmerica: "continentNorthAmerica",
  southAmerica: "continentSouthAmerica",
  oceania: "continentOceania",
  antarctica: "continentAntarctica",
  other: "continentOther",
};

// A memory only stores the country's display name (see MemoryForm), so
// grouping by continent requires matching that name back against the
// country list where the continent was determined.
const continentByCountryName = new Map(countries.map((c) => [c.name, c.continent]));

function EditPhotoModal({
  memory,
  onUpdated,
}: {
  memory: Memory;
  onUpdated: (memory: Memory) => void;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPhoto(null);
    setPasscode("");
    setError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await compressImage(file));
    } catch {
      setError(t("errorPhotoProcessing"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !passcode) return;

    setSubmitting(true);
    setError(null);

    const result = await updateMemoryPhoto(memory.id, photo, passcode);

    setSubmitting(false);

    if (!result.ok) {
      setError(translateErrorCode(result.error, "errorSaveFailed", t));
      return;
    }

    onUpdated(result.memory);
    reset();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={t("changePhotoAriaLabel")}
        className="shrink-0 text-xs text-muted transition-colors hover:text-accent"
      >
        {t("changePhotoAction")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{t("changePhotoTitle")}</h3>
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
              {t("photoLabel")}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2 w-full text-sm"
            />
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={t("photoPreviewAlt")}
                className="mt-3 max-h-48 w-full rounded-lg bg-background object-contain"
              />
            )}

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
              disabled={!photo || !passcode || submitting}
              className="mt-5 w-full rounded-full bg-accent py-2 text-sm font-semibold text-background disabled:opacity-40"
            >
              {submitting ? t("savingEdit") : t("saveEdit")}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default function Timeline({
  memories,
  onMemoryDeleted,
  onMemoryUpdated,
}: {
  memories: Memory[];
  onMemoryDeleted: (id: string) => void;
  onMemoryUpdated: (memory: Memory) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [continentFilter, setContinentFilter] = useState<ContinentKey | "other" | "all">("all");

  // Maps a memory's id to the blog post that links to it, if any, so a
  // timeline card can be clicked through to its post -- silently, with no
  // visible "linked" indicator on the card itself.
  const [postIdByMemory, setPostIdByMemory] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    fetchPosts().then((posts) => {
      const map = new Map<string, string>();
      for (const post of posts) {
        if (post.memoryId) map.set(post.memoryId, post.id);
      }
      setPostIdByMemory(map);
    });
  }, []);

  const sorted = [...memories].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Only used to populate the dropdown with continents that actually have memories.
  const presentContinents = CONTINENT_ORDER.filter((key) =>
    sorted.some((memory) => (continentByCountryName.get(memory.country) ?? "other") === key),
  );

  // "All" keeps the original flat, ungrouped timeline; picking a continent
  // narrows it down to just that continent's cards.
  const visible =
    continentFilter === "all"
      ? sorted
      : sorted.filter(
          (memory) => (continentByCountryName.get(memory.country) ?? "other") === continentFilter,
        );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (await promptAndDelete(id, t)) onMemoryDeleted(id);
  };

  if (sorted.length === 0) {
    return <p className="text-sm text-muted">{t("timelineEmpty")}</p>;
  }

  return (
    <div>
      <select
        value={continentFilter}
        onChange={(e) => setContinentFilter(e.target.value as ContinentKey | "other" | "all")}
        className="mb-8 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
      >
        <option value="all">{t("allContinents")}</option>
        {presentContinents.map((key) => (
          <option key={key} value={key}>
            {t(CONTINENT_LABEL_KEYS[key])}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((memory) => {
          const postId = postIdByMemory.get(memory.id);
          return (
            <div
              key={memory.id}
              onClick={postId ? () => router.push(`/blog/${postId}`) : undefined}
              className={`overflow-hidden rounded-2xl border border-border bg-surface ${postId ? "cursor-pointer transition-colors hover:border-accent" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={memoryPhotoUrl(memory.id, memory.updatedAt)}
                alt={memory.caption}
                className="max-h-96 w-full bg-surface object-contain"
              />
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{memory.country}</p>
                  <div className="flex shrink-0 items-center gap-3">
                    <EditPhotoModal memory={memory} onUpdated={onMemoryUpdated} />
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, memory.id)}
                      aria-label={t("deleteAriaLabel")}
                      className="shrink-0 text-xs text-muted transition-colors hover:text-accent"
                    >
                      {t("deleteAction")}
                    </button>
                  </div>
                </div>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted">
                  {new Date(memory.createdAt).toLocaleDateString(
                    locale === "ko" ? "ko-KR" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{memory.caption}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
