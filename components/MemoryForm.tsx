"use client";

import { useEffect, useState, type FormEvent } from "react";
import { countries } from "@/data/countries";
import { createMemory, type Memory } from "@/lib/memories";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

// Phone photos can be 5-15MB raw; embedding that as base64 risks tripping
// Vercel's 4.5MB serverless payload limit on save. Downscale + re-encode as
// JPEG client-side so uploads stay comfortably small regardless of source size.
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas context unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function MemoryForm({ onAdded }: { onAdded: (memory: Memory) => void }) {
  const [open, setOpen] = useState(false);
  const [countryId, setCountryId] = useState(countries[0]?.id ?? "");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [passcode, setPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
    setCountryId(countries[0]?.id ?? "");
    setPhotoDataUrl(null);
    setCaption("");
    setPasscode("");
    setError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhotoDataUrl(await compressImage(file));
    } catch {
      setError("사진을 처리하지 못했어요. 다른 사진으로 시도해주세요.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const country = countries.find((c) => c.id === countryId);
    if (!country || !photoDataUrl || !caption.trim() || !passcode) return;

    setSubmitting(true);
    setError(null);

    const result = await createMemory(
      {
        country: country.name,
        lat: country.lat,
        lng: country.lng,
        photoDataUrl,
        caption: caption.trim(),
      },
      passcode,
    );

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onAdded(result.memory);
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
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
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

            <label className="mt-4 block text-xs font-mono uppercase tracking-wide text-muted">
              비밀번호
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="소유자 비밀번호"
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />

            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={!countryId || !photoDataUrl || !caption.trim() || !passcode || submitting}
              className="mt-5 w-full rounded-full bg-accent py-2 text-sm font-semibold text-background disabled:opacity-40"
            >
              {submitting ? "저장 중..." : "기록 저장"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
