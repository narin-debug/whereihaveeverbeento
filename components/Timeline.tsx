"use client";

import { useState } from "react";
import { memoryPhotoUrl, promptAndDelete, type Memory } from "@/lib/memories";
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

  const [continentFilter, setContinentFilter] = useState<ContinentKey | "other" | "all">("all");

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

  const handleDelete = async (id: string) => {
    if (await promptAndDelete(id, t)) onMemoryDeleted(id);
  };

  if (sorted.length === 0) {
    return <p className="text-sm text-muted">{t("timelineEmpty")}</p>;
  }

  return (
    <div>
      {presentContinents.length > 1 && (
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
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((memory) => (
          <div
            key={memory.id}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
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
                <button
                  type="button"
                  onClick={() => handleDelete(memory.id)}
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
        ))}
      </div>
    </div>
  );
}
