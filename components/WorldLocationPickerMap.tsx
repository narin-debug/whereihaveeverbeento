"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useTranslations } from "@/lib/locale-context";

const WORLD_BOUNDS = L.latLngBounds([-85, -180], [85, 180]);

const pickerIcon = L.divIcon({
  className: "",
  html: '<div class="trip-marker"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function ClickToPick({ onChange }: { onChange: (loc: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyToLocation({ location }: { location: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.setView([location.lat, location.lng], 13);
  }, [location, map]);
  return null;
}

export default function WorldLocationPickerMap({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (loc: { lat: number; lng: number }) => void;
}) {
  const t = useTranslations();
  const [addressQuery, setAddressQuery] = useState("");
  const [matchedAddress, setMatchedAddress] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!addressQuery.trim()) return;
    setSearching(true);
    setSearchError(null);

    try {
      // OpenStreetMap's Nominatim geocoder -- free, no API key, and matches
      // the tile provider this map (and the world map) already uses.
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(addressQuery.trim())}`,
      );
      const results = await res.json();
      const match = results?.[0];

      if (!match) {
        setSearchError(t("addressSearchNotFound"));
        setMatchedAddress(null);
        return;
      }

      onChange({ lat: parseFloat(match.lat), lng: parseFloat(match.lon) });
      setMatchedAddress(match.display_name);
    } catch {
      setSearchError(t("addressSearchNotFound"));
      setMatchedAddress(null);
    } finally {
      setSearching(false);
    }
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
          placeholder={t("worldAddressSearchPlaceholder")}
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

      <div className="mt-2 overflow-hidden rounded-lg border border-border">
        <MapContainer
          center={value ? [value.lat, value.lng] : [20, 30]}
          zoom={value ? 13 : 2}
          minZoom={2}
          maxBounds={WORLD_BOUNDS}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={false}
          className="h-48 w-full"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            noWrap
          />
          <ClickToPick
            onChange={(loc) => {
              setMatchedAddress(null);
              onChange(loc);
            }}
          />
          <FlyToLocation location={value} />
          {value && <Marker position={[value.lat, value.lng]} icon={pickerIcon} />}
        </MapContainer>
      </div>
    </div>
  );
}
