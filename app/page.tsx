"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import { trips } from "@/data/trips";

const WorldMap = dynamic(() => import("@/components/WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted">
      지도를 불러오는 중...
    </div>
  ),
});

export default function Home() {
  return (
    <>
      <Nav />

      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.4em] text-muted"
        >
          A Travel Log
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl"
        >
          세계를 걷고,
          <br />
          기록을 <span className="text-accent">남기다</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-6 max-w-md text-sm text-muted sm:text-base"
        >
          {trips.length}개 도시를 지나며 쌓아온 여정. 지도를 눌러 각 도시의 기록을 확인하세요.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-muted"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <span className="h-8 w-px animate-pulse bg-muted" />
        </motion.div>
      </section>

      <section id="map" className="px-6 pb-24 md:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-2xl font-semibold sm:text-3xl"
        >
          지금까지의 여정
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="h-[70vh] w-full overflow-hidden rounded-2xl border border-white/10"
        >
          <WorldMap />
        </motion.div>
      </section>

      <section id="about" className="border-t border-white/10 px-6 py-16 text-center md:px-12">
        <p className="mx-auto max-w-lg text-sm text-muted">
          이 사이트는 세계여행의 순간들을 기록하기 위해 만들어졌습니다. 앞으로 다녀온 도시가
          늘어날 때마다 지도 위에 새로운 기록이 쌓입니다.
        </p>
      </section>
    </>
  );
}
