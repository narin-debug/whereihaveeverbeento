import { feature } from "topojson-client";
import isoCountries from "i18n-iso-countries";
import ko from "i18n-iso-countries/langs/ko.json";
import countries110m from "world-atlas/countries-110m.json";
import { capitalCoordinates } from "./capital-coordinates";

isoCountries.registerLocale(ko);

// i18n-iso-countries has no ISO entry for these disputed/unrecognized regions.
const NAME_OVERRIDES_BY_TOPO_NAME: Record<string, string> = {
  "N. Cyprus": "북키프로스",
  Somaliland: "소말릴란드",
  Kosovo: "코소보",
};

// The library's default Korean name predates Turkey's 2022 rename request.
const NAME_OVERRIDES_BY_ALPHA2: Record<string, string> = {
  TR: "튀르키예",
};

export type Country = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

const topology = countries110m as unknown as Parameters<typeof feature>[0];
const objects = (topology as { objects: Record<string, unknown> }).objects;
const geo = feature(
  topology,
  objects.countries as Parameters<typeof feature>[1],
) as unknown as {
  features: Array<GeoJSON.Feature & { id?: string | number; properties: { name: string } }>;
};

export const countries: Country[] = geo.features
  .map((f) => {
    // A handful of disputed/unrecognized regions have no ISO numeric code in
    // this dataset, so fall back to their topojson name to keep ids unique.
    const id = f.id != null ? String(f.id) : f.properties.name;
    const alpha2 = f.id != null ? isoCountries.numericToAlpha2(id) : undefined;
    const name =
      (alpha2 && NAME_OVERRIDES_BY_ALPHA2[alpha2]) ??
      (alpha2 ? isoCountries.getName(alpha2, "ko") : undefined) ??
      NAME_OVERRIDES_BY_TOPO_NAME[f.properties.name] ??
      f.properties.name;
    // Use the capital city's coordinates rather than the landmass centroid --
    // countries with far-flung overseas territories (e.g. France + French
    // Guiana) produce a combined centroid nowhere near the country itself.
    const coords = capitalCoordinates[id];
    if (!coords) return null;
    const [lat, lng] = coords;
    return { id, name, lat, lng };
  })
  .filter((c): c is Country => c !== null)
  .sort((a, b) => a.name.localeCompare(b.name, "ko"));
