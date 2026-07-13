"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { memoryPhotoUrl, promptAndDelete, type Memory } from "@/lib/memories";
import { useTranslations } from "@/lib/locale-context";

const KOREA_BOUNDS = L.latLngBounds([32.9, 124.0], [38.7, 131.5]);

const tripIcon = L.divIcon({
  className: "",
  html: '<div class="trip-marker"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

function InvalidateSizeOnMount() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

export default function DomesticMap({
  memories,
  onMemoryDeleted,
}: {
  memories: Memory[];
  onMemoryDeleted: (id: string) => void;
}) {
  const t = useTranslations();

  const handleDelete = async (id: string) => {
    if (await promptAndDelete(id, t)) onMemoryDeleted(id);
  };

  return (
    <MapContainer
      center={[36.3, 127.8]}
      zoom={7}
      minZoom={6}
      maxBounds={KOREA_BOUNDS}
      maxBoundsViscosity={1.0}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <InvalidateSizeOnMount />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {memories.map((memory) => (
        <Marker key={memory.id} position={[memory.lat, memory.lng]} icon={tripIcon}>
          <Popup>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={memoryPhotoUrl(memory.id, memory.updatedAt)}
              alt={memory.caption}
              className="h-24 w-full rounded-md object-cover"
            />
            <p className="mt-2 text-sm leading-relaxed">{memory.caption}</p>
            <button
              type="button"
              onClick={() => handleDelete(memory.id)}
              aria-label={t("deleteAriaLabel")}
              className="mt-2 text-xs text-muted transition-colors hover:text-accent"
            >
              {t("deleteAction")}
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
