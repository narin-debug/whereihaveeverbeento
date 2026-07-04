"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import GlobeSpotlight from "@/components/GlobeSpotlight";
import MemoryForm from "@/components/MemoryForm";
import { fetchMemories, type Memory } from "@/lib/memories";

const WorldMap = dynamic(() => import("@/components/WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted">
      지도를 불러오는 중...
    </div>
  ),
});

export default function Home() {
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    fetchMemories().then(setMemories);
  }, []);

  const handleMemoryAdded = (memory: Memory) => {
    setMemories((prev) => [...prev, memory]);
  };

  const handleMemoryDeleted = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <>
      <Nav />

      <GlobeSpotlight>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs uppercase tracking-[0.4em] text-muted"
        >
          A Travel Log
        </motion.p>
        <motion.h1
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1.1, delay: 0.2, ease: "easeInOut" }}
          className="mt-6 text-6xl font-black tracking-tight sm:text-8xl"
        >
          Voyager
        </motion.h1>
      </GlobeSpotlight>

      <section id="map" className="px-6 pb-24 md:px-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold sm:text-3xl"
          >
            지금까지의 여정
          </motion.h2>
          <MemoryForm onAdded={handleMemoryAdded} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="h-[70vh] w-full overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <WorldMap memories={memories} onMemoryDeleted={handleMemoryDeleted} />
        </motion.div>
      </section>

      <section id="about" className="border-t border-border px-6 py-16 text-center md:px-12">
        <p className="mx-auto max-w-lg text-sm text-muted">
          이 사이트는 세계여행의 순간들을 기록하기 위해 만들어졌습니다. 앞으로 다녀온 도시가
          늘어날 때마다 지도 위에 새로운 기록이 쌓입니다.
        </p>
      </section>
    </>
  );
}
