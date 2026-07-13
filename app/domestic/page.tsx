"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import MemoryForm from "@/components/MemoryForm";
import Timeline from "@/components/Timeline";
import { fetchMemories, type Memory } from "@/lib/memories";
import { useTranslations } from "@/lib/locale-context";

const DomesticMap = dynamic(() => import("@/components/DomesticMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

const DOMESTIC_COUNTRY_NAME = "대한민국";

function MapLoading() {
  const t = useTranslations();
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted">
      {t("mapLoading")}
    </div>
  );
}

export default function DomesticPage() {
  const t = useTranslations();
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    fetchMemories().then(setMemories);
  }, []);

  const domesticMemories = useMemo(
    () => memories.filter((m) => m.country === DOMESTIC_COUNTRY_NAME),
    [memories],
  );

  const handleMemoryAdded = (memory: Memory) => {
    setMemories((prev) => [...prev, memory]);
  };

  const handleMemoryDeleted = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <>
      <Nav />

      <section className="px-6 pb-24 pt-32 md:px-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("domesticHeading")}</h2>
          <MemoryForm onAdded={handleMemoryAdded} />
        </div>
        <div className="h-[70vh] w-full overflow-hidden rounded-2xl border border-border bg-surface">
          <DomesticMap memories={domesticMemories} onMemoryDeleted={handleMemoryDeleted} />
        </div>
      </section>

      <section className="border-t border-border px-6 pb-24 pt-16 md:px-12">
        <Timeline memories={domesticMemories} onMemoryDeleted={handleMemoryDeleted} />
      </section>
    </>
  );
}
