"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { trips } from "@/data/trips";
import type { Memory } from "@/lib/memories";

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
    const id = window.setTimeout(() => map.invalidateSize(), 150);
    return () => window.clearTimeout(id);
  }, [map]);

  return null;
}

function MemoryList({ memories }: { memories: Memory[] }) {
  if (memories.length === 0) return null;
  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
      {memories.map((memory) => (
        <div key={memory.id} className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={memory.photoDataUrl}
            alt={memory.caption}
            className="h-12 w-12 shrink-0 rounded-md object-cover"
          />
          <p className="text-xs leading-snug">{memory.caption}</p>
        </div>
      ))}
    </div>
  );
}

export default function WorldMap({ memories }: { memories: Memory[] }) {
  const tripCountries = useMemo(() => new Set(trips.map((t) => t.country)), []);

  const memoriesByCountry = useMemo(() => {
    const map = new Map<string, Memory[]>();
    for (const memory of memories) {
      if (tripCountries.has(memory.country)) continue;
      const list = map.get(memory.country) ?? [];
      list.push(memory);
      map.set(memory.country, list);
    }
    return map;
  }, [memories, tripCountries]);

  return (
    <MapContainer
      center={[20, 30]}
      zoom={2}
      minZoom={2}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <InvalidateSizeOnMount />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
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
              <MemoryList memories={tripMemories} />
            </Popup>
          </Marker>
        );
      })}
      {[...memoriesByCountry.entries()].map(([country, countryMemories]) => (
        <Marker
          key={country}
          position={[countryMemories[0].lat, countryMemories[0].lng]}
          icon={tripIcon}
        >
          <Popup>
            <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
              {country}
            </p>
            <MemoryList memories={countryMemories} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
