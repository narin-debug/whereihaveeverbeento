"use client";

import { useEffect, useRef, useState } from "react";
import { loadNaverMaps } from "@/lib/naver-maps";
import { useTranslations } from "@/lib/locale-context";

export default function LocationPickerMap({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (loc: { lat: number; lng: number }) => void;
}) {
  const t = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [addressQuery, setAddressQuery] = useState("");
  const [matchedAddress, setMatchedAddress] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadNaverMaps().then(() => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const { naver } = window;

      mapRef.current = new naver.maps.Map(containerRef.current, {
        center: new naver.maps.LatLng(36.3, 127.8),
        zoom: 7,
        minZoom: 6,
      });

      naver.maps.Event.addListener(mapRef.current, "click", (e: { coord: { y: number; x: number } }) => {
        setMatchedAddress(null);
        onChangeRef.current({ lat: e.coord.y, lng: e.coord.x });
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const { naver } = window;

    if (!value) {
      markerRef.current?.setMap(null);
      markerRef.current = null;
      return;
    }

    const position = new naver.maps.LatLng(value.lat, value.lng);
    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new naver.maps.Marker({ position, map: mapRef.current });
    }
  }, [value]);

  const handleSearch = async () => {
    if (!addressQuery.trim()) return;
    setSearching(true);
    setSearchError(null);

    await loadNaverMaps();
    const { naver } = window;

    naver.maps.Service.geocode({ query: addressQuery.trim() }, (status: number, response: any) => {
      setSearching(false);
      const address = response?.v2?.addresses?.[0];
      if (status !== naver.maps.Service.Status.OK || !address) {
        setSearchError(t("addressSearchNotFound"));
        setMatchedAddress(null);
        return;
      }

      const lat = parseFloat(address.y);
      const lng = parseFloat(address.x);
      onChangeRef.current({ lat, lng });
      setMatchedAddress(address.roadAddress || address.jibunAddress);
      mapRef.current.setCenter(new naver.maps.LatLng(lat, lng));
      mapRef.current.setZoom(15);
    });
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={addressQuery}
          onChange={(e) => setAddressQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder={t("addressSearchPlaceholder")}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!addressQuery.trim() || searching}
          className="shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm disabled:opacity-40"
        >
          {t("addressSearchButton")}
        </button>
      </div>
      {matchedAddress && <p className="mt-1 text-xs text-muted">{matchedAddress}</p>}
      {searchError && <p className="mt-1 text-xs text-red-600">{searchError}</p>}
      <div ref={containerRef} className="mt-2 h-48 w-full rounded-lg" />
    </div>
  );
}
