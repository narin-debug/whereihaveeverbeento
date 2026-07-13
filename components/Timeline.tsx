"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { memoryPhotoUrl, promptAndDelete, type Memory } from "@/lib/memories";
import { fetchPosts } from "@/lib/posts";
import { countries } from "@/data/countries";
import type { ContinentKey } from "@/data/continents";
import { useLocale, useTranslations } from "@/lib/locale-context";
import type { TranslationKey } from "@/lib/i18n";

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

export default function Timeline({
  memories,
  onMemoryDeleted,
}: {
  memories: Memory[];
  onMemoryDeleted: (id: string) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

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

  const grouped = CONTINENT_ORDER.map((key) => ({
    key,
    memories: sorted.filter(
      (memory) => (continentByCountryName.get(memory.country) ?? "other") === key,
    ),
  })).filter((group) => group.memories.length > 0);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (await promptAndDelete(id, t)) onMemoryDeleted(id);
  };

  if (sorted.length === 0) {
    return <p className="text-sm text-muted">{t("timelineEmpty")}</p>;
  }

  return (
    <div className="space-y-10">
      {grouped.map((group) => (
        <div key={group.key}>
          <h3 className="mb-4 font-mono text-xs uppercase tracking-wide text-muted">
            {t(CONTINENT_LABEL_KEYS[group.key])}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.memories.map((memory) => {
              const postId = postIdByMemory.get(memory.id);
              return (
                <div
                  key={memory.id}
                  onClick={postId ? () => router.push(`/blog/${postId}`) : undefined}
                  className={`overflow-hidden rounded-2xl border border-border bg-surface ${postId ? "cursor-pointer transition-colors hover:border-accent" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={memoryPhotoUrl(memory.id)}
                    alt={memory.caption}
                    className="max-h-96 w-full bg-surface object-contain"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold">{memory.country}</p>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, memory.id)}
                        aria-label={t("deleteAriaLabel")}
                        className="shrink-0 text-xs text-muted transition-colors hover:text-accent"
                      >
                        {t("deleteAction")}
                      </button>
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
      ))}
    </div>
  );
}
