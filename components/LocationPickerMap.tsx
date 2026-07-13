"use client";

import { useEffect, useRef } from "react";
import { loadNaverMaps } from "@/lib/naver-maps";

export default function LocationPickerMap({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (loc: { lat: number; lng: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

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

  return <div ref={containerRef} className="h-48 w-full rounded-lg" />;
}
