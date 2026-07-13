"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { trips } from "@/data/trips";
import { memoryPhotoUrl, promptAndDelete, type Memory } from "@/lib/memories";
import { useTranslations } from "@/lib/locale-context";

// Keep the map to a single, non-repeating world -- Leaflet's default lets you
// pan/scroll horizontally forever, revealing duplicate copies of every continent.
const WORLD_BOUNDS = L.latLngBounds([-85, -180], [85, 180]);

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
    // A fixed delay can't account for layout shifts that happen later (web
    // fonts loading, the section's fade-in animation, orientation changes),
    // so keep the map's internal size in sync with its container for as
    // long as it's mounted, not just once on load.
    map.invalidateSize();
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

function MemoryList({
  memories,
  onDeleted,
}: {
  memories: Memory[];
  onDeleted: (id: string) => void;
}) {
  const t = useTranslations();

  if (memories.length === 0) return null;

  const handleDelete = async (id: string) => {
    if (await promptAndDelete(id, t)) onDeleted(id);
  };

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
      {memories.map((memory) => (
        <div key={memory.id} className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={memoryPhotoUrl(memory.id, memory.updatedAt)}
            alt={memory.caption}
            className="h-12 w-12 shrink-0 rounded-md object-cover"
          />
          <p className="flex-1 text-xs leading-snug">{memory.caption}</p>
          <button
            type="button"
            onClick={() => handleDelete(memory.id)}
            aria-label={t("deleteAriaLabel")}
            className="shrink-0 text-xs text-muted transition-colors hover:text-accent"
          >
            {t("deleteAction")}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function WorldMap({
  memories,
  onMemoryDeleted,
}: {
  memories: Memory[];
  onMemoryDeleted: (id: string) => void;
}) {
  return (
    <MapContainer
      center={[20, 30]}
      zoom={2}
      minZoom={2}
      maxBounds={WORLD_BOUNDS}
      maxBoundsViscosity={1.0}
      worldCopyJump={false}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <InvalidateSizeOnMount />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        noWrap
      />
      {trips.map((trip) => {
        const tripMemories = memories.filter((m) => m.country === trip.country);
        return (
          <Marker key={trip.id} position={[trip.lat, trip.lng]} icon={tripIcon}>
            <Popup>
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
                {trip.country} · {trip.city} · {trip.date}
              </p>
              <p className="mt-1 font-bold text-accent">{trip.title}</p>
              <p className="mt-1 text-sm leading-relaxed">{trip.description}</p>
              <MemoryList memories={tripMemories} onDeleted={onMemoryDeleted} />
            </Popup>
          </Marker>
        );
      })}
      {memories.map((memory) => (
        <Marker key={memory.id} position={[memory.lat, memory.lng]} icon={tripIcon}>
          <Popup>
            <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
              {memory.country}
            </p>
            <MemoryList memories={[memory]} onDeleted={onMemoryDeleted} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
