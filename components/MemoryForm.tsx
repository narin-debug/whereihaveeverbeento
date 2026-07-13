"use client";

import { useEffect, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { countries } from "@/data/countries";
import { createMemory, type Memory } from "@/lib/memories";
import { compressImage } from "@/lib/images";
import { translateErrorCode } from "@/lib/i18n";
import { useTranslations } from "@/lib/locale-context";

const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap"), {
  ssr: false,
});
const WorldLocationPickerMap = dynamic(() => import("@/components/WorldLocationPickerMap"), {
  ssr: false,
});

const DOMESTIC_COUNTRY_NAME = "대한민국";

export default function MemoryForm({ onAdded }: { onAdded: (memory: Memory) => void }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [countryId, setCountryId] = useState(countries[0]?.id ?? "");
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [passcode, setPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCountry = countries.find((c) => c.id === countryId);
  const isDomestic = selectedCountry?.name === DOMESTIC_COUNTRY_NAME;

  // A location picked for one country shouldn't silently carry over if the
  // destination is changed mid-edit.
  useEffect(() => {
    setPickedLocation(null);
    setShowLocationPicker(false);
  }, [countryId]);

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
    setPickedLocation(null);
    setShowLocationPicker(false);
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
      setError(t("errorPhotoProcessing"));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const country = countries.find((c) => c.id === countryId);
    if (!country || !photoDataUrl || !caption.trim() || !passcode) return;
    if (isDomestic && !pickedLocation) return;

    setSubmitting(true);
    setError(null);

    const result = await createMemory(
      {
        country: country.name,
        lat: pickedLocation ? pickedLocation.lat : country.lat,
        lng: pickedLocation ? pickedLocation.lng : country.lng,
        photoDataUrl,
        caption: caption.trim(),
      },
      passcode,
    );

    setSubmitting(false);

    if (!result.ok) {
      setError(translateErrorCode(result.error, "errorSaveFailed", t));
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
        {t("addMemory")}
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
              <h3 className="text-lg font-bold">{t("formTitle")}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="text-muted transition-colors hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <label className="mt-5 block text-xs font-mono uppercase tracking-wide text-muted">
              {t("destinationLabel")}
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

            {isDomestic && (
              <>
                <label className="mt-4 block text-xs font-mono uppercase tracking-wide text-muted">
                  {t("pickLocationLabel")}
                </label>
                <p className="mt-1 text-xs text-muted">{t("pickLocationHint")}</p>
                <div className="mt-2 overflow-hidden rounded-lg border border-border">
                  <LocationPickerMap value={pickedLocation} onChange={setPickedLocation} />
                </div>
              </>
            )}

            {!isDomestic && (
              <div className="mt-4">
                {showLocationPicker ? (
                  <>
                    <label className="block text-xs font-mono uppercase tracking-wide text-muted">
                      {t("pickLocationLabel")}
                    </label>
                    <WorldLocationPickerMap value={pickedLocation} onChange={setPickedLocation} />
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="text-xs text-muted transition-colors hover:text-accent"
                  >
                    {t("pickLocationToggle")}
                  </button>
                )}
              </div>
            )}

            <label className="mt-4 block text-xs font-mono uppercase tracking-wide text-muted">
              {t("photoLabel")}
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
                alt={t("photoPreviewAlt")}
                className="mt-3 h-32 w-full rounded-lg object-cover"
              />
            )}

            <label className="mt-4 block text-xs font-mono uppercase tracking-wide text-muted">
              {t("captionLabel")}
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t("captionPlaceholder")}
              rows={3}
              className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />

            <label className="mt-4 block text-xs font-mono uppercase tracking-wide text-muted">
              {t("passwordLabel")}
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />

            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={
                !countryId ||
                !photoDataUrl ||
                !caption.trim() ||
                !passcode ||
                submitting ||
                (isDomestic && !pickedLocation)
              }
              className="mt-5 w-full rounded-full bg-accent py-2 text-sm font-semibold text-background disabled:opacity-40"
            >
              {submitting ? t("saving") : t("saveMemory")}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
