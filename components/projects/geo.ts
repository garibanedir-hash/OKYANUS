import { geoGraticule, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import type { ProjectRegion } from "@/data/projectRegions";

export type RegionGeoFeature = {
  id?: string | number;
  properties?: Record<string, unknown>;
  geometry?: unknown;
};

export type RegionProjectionResult = {
  countries: RegionGeoFeature[];
  path: (feature: unknown) => string | null;
  project: (coords: ProjectRegion["coords"]) => [number, number] | null;
  graticulePath: string | null;
};

const NEAR_REGION_COUNTRY_IDS = new Set([
  "275", // Palestine / Gaza area
  "376", // Israel
  "400", // Jordan
  "422", // Lebanon
  "760", // Syria
  "792", // Turkey
  "818", // Egypt
  "196", // Cyprus
  "300", // Greece
  "368", // Iraq
  "682", // Saudi Arabia
  "434" // Libya
]);

const ACTIVE_COUNTRY_IDS = new Set(["275", "422", "792", "818"]);

export function isActiveRegionCountry(feature: RegionGeoFeature) {
  return ACTIVE_COUNTRY_IDS.has(String(feature.id));
}

export function createRegionGeo(width: number, height: number): RegionProjectionResult {
  const collection = feature((worldAtlas as any), (worldAtlas as any).objects.countries);
  const countries = ((collection.features ?? []) as RegionGeoFeature[]).filter((country) =>
    NEAR_REGION_COUNTRY_IDS.has(String(country.id))
  );

  const projection = geoMercator().fitExtent(
    [
      [18, 24],
      [width - 18, height - 24]
    ],
    { type: "FeatureCollection", features: countries }
  );
  const path = geoPath(projection);
  const graticule = geoGraticule().extent([
    [24, 24],
    [46, 43]
  ]).step([4, 4]);

  return {
    countries,
    path,
    project: (coords) => projection(coords),
    graticulePath: path(graticule())
  };
}
