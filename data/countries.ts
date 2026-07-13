import { feature } from "topojson-client";
import isoCountries from "i18n-iso-countries";
import ko from "i18n-iso-countries/langs/ko.json";
import countries110m from "world-atlas/countries-110m.json";
import { capitalCoordinates } from "./capital-coordinates";
import { countryContinents, type ContinentKey } from "./continents";

isoCountries.registerLocale(ko);

// i18n-iso-countries has no ISO entry for these disputed/unrecognized regions.
const NAME_OVERRIDES_BY_TOPO_NAME: Record<string, string> = {
  "N. Cyprus": "북키프로스",
  Somaliland: "소말릴란드",
  Kosovo: "코소보",
};

// The library's default Korean names are sometimes formal, outdated, or
// misspelled rather than the name Korean speakers would actually search for.
const NAME_OVERRIDES_BY_ALPHA2: Record<string, string> = {
  TR: "튀르키예", // predates Turkey's 2022 rename request
  TW: "대만", // library defaults to the formal "중화민국"
  GE: "조지아", // "그루지아" is the old Russian-derived name
  SZ: "에스와티니", // renamed from Swaziland in 2018
  CY: "키프로스", // "사이프러스" is a less common transliteration
  CZ: "체코", // "체코공화국" is the formal name
  ET: "에티오피아", // "이디오피아" is a dated spelling
  TN: "튀니지", // "튀니지아" is a misspelling
  TM: "투르크메니스탄", // "트르크메니스탄" is a misspelling
  PT: "포르투갈", // "포르투칼" is a misspelling
  PL: "폴란드", // "폴랜드" is a misspelling
  GL: "그린란드", // "그린랜드" is a misspelling
  GW: "기니비사우", // "기네비쏘" is a misspelling
  AQ: "남극", // "안타티카" is an odd transliteration
  KG: "키르기스스탄", // "키르키즈스탄" is a misspelling
  ZW: "짐바브웨", // "짐바브웨 공화국" is the formal name
  RU: "러시아", // "러시아연방" is the formal name
  AE: "아랍에미리트", // "아랍에미리트연합" is non-standard
};

export type Country = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  continent: ContinentKey;
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
    // Guaranteed present: continents.ts mirrors capital-coordinates.ts's key set exactly.
    const continent = countryContinents[id];
    return { id, name, lat, lng, continent };
  })
  .filter((c): c is Country => c !== null)
  .sort((a, b) => a.name.localeCompare(b.name, "ko"));
