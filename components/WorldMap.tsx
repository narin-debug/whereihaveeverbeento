"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { trips } from "@/data/trips";

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

export default function WorldMap() {
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
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {trips.map((trip) => (
        <Marker key={trip.id} position={[trip.lat, trip.lng]} icon={tripIcon}>
          <Popup>
            <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
              {trip.country} · {trip.city} · {trip.date}
            </p>
            <p className="mt-1 font-bold text-accent">{trip.title}</p>
            <p className="mt-1 text-sm leading-relaxed">{trip.description}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
