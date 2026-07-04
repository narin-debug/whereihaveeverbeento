"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

function GlobeWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      {...props}
    >
      <circle cx="100" cy="100" r="90" />
      <line x1="100" y1="10" x2="100" y2="190" />
      <ellipse cx="100" cy="100" rx="45" ry="90" />
      <ellipse cx="100" cy="100" rx="78" ry="90" />
      <ellipse cx="100" cy="100" rx="90" ry="16" />
      <ellipse cx="100" cy="70" rx="85" ry="12" />
      <ellipse cx="100" cy="130" rx="85" ry="12" />
      <ellipse cx="100" cy="40" rx="69" ry="9" />
      <ellipse cx="100" cy="160" rx="69" ry="9" />
    </svg>
  );
}

export default function GlobeSpotlight({ children }: { children?: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect();
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
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
    >
      <GlobeWireframe className="pointer-events-none absolute h-[130vh] w-[130vh] max-w-none text-muted/20" />

      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0"
        style={{ "--x": "50%", "--y": "50%" } as CSSProperties}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            maskImage:
              "radial-gradient(220px 220px at var(--x) var(--y), black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(220px 220px at var(--x) var(--y), black 0%, transparent 70%)",
          }}
        >
          <GlobeWireframe
            className="h-[130vh] w-[130vh] max-w-none text-accent"
            style={{ filter: "drop-shadow(0 0 10px var(--accent-glow))" }}
          />
        </div>
      </div>

      {/* z-index applies without `position: relative` since this is a flex item of the wrapper above */}
      <div className="z-10 flex flex-col items-center px-6 text-center">
        {children}
      </div>
    </div>
  );
}
