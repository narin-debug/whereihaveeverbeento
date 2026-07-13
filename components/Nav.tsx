"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/locale-context";

export default function Nav() {
  const t = useTranslations();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border bg-background/70 px-6 py-5 backdrop-blur-md md:px-12">
      <span className="font-mono text-sm font-bold tracking-[0.2em] uppercase">
        Wander<span className="text-accent">log</span>
      </span>
      <nav className="flex gap-6 font-mono text-sm text-muted">
        <Link href="/#map" className="transition-colors hover:text-foreground">
          {t("navMap")}
        </Link>
        <Link href="/#about" className="transition-colors hover:text-foreground">
          {t("navAbout")}
        </Link>
      </nav>
    </header>
  );
}
