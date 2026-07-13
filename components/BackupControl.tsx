"use client";

import { useState } from "react";
import {
  fetchMemories,
  memoryPhotoUrl,
  restoreMemory,
  type BackupMemory,
} from "@/lib/memories";
import { translateErrorCode } from "@/lib/i18n";
import { useTranslations } from "@/lib/locale-context";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export default function BackupControl() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [passcode, setPasscode] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSummary, setRestoreSummary] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const memories = await fetchMemories();
      const backup: BackupMemory[] = await Promise.all(
        memories.map(async (memory) => {
          const res = await fetch(memoryPhotoUrl(memory.id, memory.updatedAt));
          const photoDataUrl = await blobToDataUrl(await res.blob());
          return { ...memory, photoDataUrl };
        }),
      );

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wanderlog-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError(t("errorSaveFailed"));
    } finally {
      setExporting(false);
    }
  };

  const handleRestore = async () => {
    if (!file || !passcode) return;
    setRestoring(true);
    setRestoreError(null);
    setRestoreSummary(null);

    try {
      const parsed = JSON.parse(await file.text()) as BackupMemory[];
      let restored = 0;
      let skipped = 0;

      for (const memory of parsed) {
        const result = await restoreMemory(memory, passcode);
        if (!result.ok) {
          setRestoreError(translateErrorCode(result.error, "errorSaveFailed", t));
          setRestoring(false);
          return;
        }
        if (result.restored) restored++;
        else skipped++;
      }

      setRestoreSummary(t("restoreSummary").replace("{restored}", String(restored)).replace("{skipped}", String(skipped)));
      setFile(null);
      setPasscode("");
    } catch {
      setRestoreError(t("errorRestoreParse"));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted transition-colors hover:text-accent"
      >
        {t("backupLinkLabel")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{t("backupTitle")}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="text-muted transition-colors hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="mt-5">
              <p className="text-xs font-mono uppercase tracking-wide text-muted">
                {t("backupExportLabel")}
              </p>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="mt-2 w-full rounded-full border border-border bg-background py-2 text-sm font-medium disabled:opacity-40"
              >
                {exporting ? t("backupExporting") : t("backupExportButton")}
              </button>
              {exportError && <p className="mt-2 text-xs text-red-600">{exportError}</p>}
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <p className="text-xs font-mono uppercase tracking-wide text-muted">
                {t("backupRestoreLabel")}
              </p>
              <input
                type="file"
                accept="application/json"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-2 w-full text-sm"
              />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleRestore}
                disabled={!file || !passcode || restoring}
                className="mt-3 w-full rounded-full bg-accent py-2 text-sm font-semibold text-background disabled:opacity-40"
              >
                {restoring ? t("backupRestoring") : t("backupRestoreButton")}
              </button>
              {restoreError && <p className="mt-2 text-xs text-red-600">{restoreError}</p>}
              {restoreSummary && <p className="mt-2 text-xs text-muted">{restoreSummary}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
