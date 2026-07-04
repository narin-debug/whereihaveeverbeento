"use client";

import { useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import countries110m from "world-atlas/countries-110m.json";

const SIZE = 400;
const RADIUS = SIZE / 2 - 4;

function useGlobePaths() {
  return useMemo(() => {
    const topology = countries110m as unknown as Parameters<typeof feature>[0];
    const objects = (topology as { objects: Record<string, unknown> }).objects;
    const geo = feature(
      topology,
      objects.countries as Parameters<typeof feature>[1],
    ) as unknown as { features: GeoJSON.Feature[] };

    const projection = geoOrthographic()
      .scale(RADIUS)
      .translate([SIZE / 2, SIZE / 2])
      .rotate([-20, -15, 0]);
    const path = geoPath(projection);

    return {
      outline: path({ type: "Sphere" }) ?? "",
      countries: geo.features.map((f) => path(f) ?? "").filter(Boolean),
    };
  }, []);
}

function Globe(props: React.SVGProps<SVGSVGElement>) {
  const { outline, countries } = useGlobePaths();
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} {...props}>
      <path d={outline} fill="none" stroke="currentColor" strokeOpacity={0.35} />
      {countries.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="currentColor"
          fillOpacity={0.35}
          stroke="currentColor"
          strokeWidth={0.6}
        />
      ))}
    </svg>
  );
}

export default function GlobeSpotlight({ children }: { children?: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = globeRef.current?.getBoundingClientRect();
    if (!rect || !glowRef.current) return;
    glowRef.current.style.setProperty("--x", `${e.clientX - rect.left}px`);
    glowRef.current.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  const handleLeave = () => {
    glowRef.current?.style.setProperty("--x", "50%");
    glowRef.current?.style.setProperty("--y", "50%");
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative flex min-h-screen w-full flex-col items-center justify-center gap-10 overflow-hidden py-24"
    >
      {/* z-index applies without `position: relative` since this is a flex item of the wrapper below */}
      <div className="z-10 flex flex-col items-center px-6 text-center">
        {children}
      </div>

      <motion.div
        ref={globeRef}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 1.5, ease: "easeOut" }}
        className="relative h-[52vh] w-[52vh] max-h-[480px] max-w-[480px]"
      >
        <Globe className="pointer-events-none absolute inset-0 h-full w-full text-muted/50" />

        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0"
          style={{ "--x": "50%", "--y": "50%" } as CSSProperties}
        >
          <div
            className="absolute inset-0"
            style={{
              maskImage:
                "radial-gradient(180px 180px at var(--x) var(--y), black 0%, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(180px 180px at var(--x) var(--y), black 0%, transparent 70%)",
            }}
          >
            <Globe
              className="h-full w-full text-accent"
              style={{ filter: "drop-shadow(0 0 8px var(--accent-glow))" }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 2.3 }}
        className="z-10 flex flex-col items-center gap-2 text-muted"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-8 w-px animate-pulse bg-muted" />
      </motion.div>
    </div>
  );
}
