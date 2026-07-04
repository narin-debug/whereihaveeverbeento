"use client";

import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import countries110m from "world-atlas/countries-110m.json";

const SIZE = 400;
const RADIUS = SIZE / 2 - 4;
const DEGREES_PER_MS = 360 / 45000; // one full spin every ~45s

function useCountryFeatures() {
  return useMemo(() => {
    const topology = countries110m as unknown as Parameters<typeof feature>[0];
    const objects = (topology as { objects: Record<string, unknown> }).objects;
    const geo = feature(
      topology,
      objects.countries as Parameters<typeof feature>[1],
    ) as unknown as { features: GeoJSON.Feature[] };
    return geo.features;
  }, []);
}

function GlobeLayer({
  count,
  outlineRef,
  pathRefs,
  className,
  style,
}: {
  count: number;
  outlineRef: React.Ref<SVGPathElement>;
  pathRefs: React.MutableRefObject<(SVGPathElement | null)[]>;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} style={style}>
      <path ref={outlineRef} fill="none" stroke="currentColor" strokeOpacity={0.35} />
      {Array.from({ length: count }).map((_, i) => (
        <path
          key={i}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
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
  const features = useCountryFeatures();

  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const dimOutlineRef = useRef<SVGPathElement>(null);
  const brightOutlineRef = useRef<SVGPathElement>(null);
  const dimPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const brightPathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const projection = geoOrthographic().scale(RADIUS).translate([SIZE / 2, SIZE / 2]);
    const path = geoPath(projection);
    let lambda = -20;
    let lastTime = performance.now();
    let rafId: number;

    const render = () => {
      projection.rotate([lambda, -15, 0]);

      const outlineD = path({ type: "Sphere" }) ?? "";
      dimOutlineRef.current?.setAttribute("d", outlineD);
      brightOutlineRef.current?.setAttribute("d", outlineD);

      features.forEach((f, i) => {
        const d = path(f) ?? "";
        dimPathRefs.current[i]?.setAttribute("d", d);
        brightPathRefs.current[i]?.setAttribute("d", d);
      });
    };

    // Paint the first frame synchronously so the globe is visible even if
    // requestAnimationFrame is throttled (e.g. the tab starts backgrounded).
    render();

    const tick = (time: number) => {
      lambda += (time - lastTime) * DEGREES_PER_MS;
      lastTime = time;
      render();
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [features]);

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
        <GlobeLayer
          count={features.length}
          outlineRef={dimOutlineRef}
          pathRefs={dimPathRefs}
          className="pointer-events-none absolute inset-0 h-full w-full text-muted/50"
        />

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
            <GlobeLayer
              count={features.length}
              outlineRef={brightOutlineRef}
              pathRefs={brightPathRefs}
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
