"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Trip } from "@/data/trips";
import type { Memory } from "@/lib/memories";

export default function MemoryForm({
  trips,
  onAdd,
}: {
  trips: Trip[];
  onAdd: (memory: Memory) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const [tripId, setTripId] = useState(trips[0]?.id ?? "");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  const resetForm = () => {
    setTripId(trips[0]?.id ?? "");
    setPhotoDataUrl(null);
    setCaption("");
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!tripId || !photoDataUrl || !caption.trim()) return;

    const memory: Memory = {
      id: crypto.randomUUID(),
      tripId,
      photoDataUrl,
      caption: caption.trim(),
      createdAt: new Date().toISOString(),
    };

    setError(null);
    const ok = onAdd(memory);
    if (ok === false) {
      setError("저장 공간이 부족해요. 더 작은 사진으로 다시 시도해주세요.");
      return;
    }
    resetForm();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent"
      >
        + 기록 남기기
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">새 기록 남기기</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="text-muted transition-colors hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <label className="mt-5 block text-xs font-mono uppercase tracking-wide text-muted">
              여행지
            </label>
            <select
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.country} · {trip.city}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-xs font-mono uppercase tracking-wide text-muted">
              사진
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2 w-full text-sm"
            />
            {photoDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoDataUrl}
                alt="선택한 사진 미리보기"
                className="mt-3 h-32 w-full rounded-lg object-cover"
              />
            )}

            <label className="mt-4 block text-xs font-mono uppercase tracking-wide text-muted">
              캡션
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="이 순간을 짧게 남겨보세요"
              rows={3}
              className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />

            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={!tripId || !photoDataUrl || !caption.trim()}
              className="mt-5 w-full rounded-full bg-accent py-2 text-sm font-semibold text-background disabled:opacity-40"
            >
              기록 저장
            </button>
          </form>
        </div>
      )}
    </>
  );
}
