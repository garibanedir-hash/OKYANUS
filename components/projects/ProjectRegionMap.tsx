"use client";

import { useMemo, useState } from "react";
import type { ProjectRegion } from "@/data/projectRegions";
import { createRegionGeo, isActiveRegionCountry } from "@/components/projects/geo";
import { ProjectRegionZoomControls } from "@/components/projects/ProjectRegionZoomControls";
import { cn } from "@/lib/utils";

type ProjectRegionMapProps = {
  regions: ProjectRegion[];
  activeRegionSlug: ProjectRegion["slug"];
  onSelect: (slug: ProjectRegion["slug"]) => void;
  compact?: boolean;
};

type ProjectedRegion = ProjectRegion & {
  projected: { x: number; y: number };
};

const VIEWBOX = { width: 920, height: 620 };

function getMarkerRadius(region: ProjectRegion) {
  return 4.8 + Math.min(4.5, region.projectCount * 0.35);
}

function getTransformPoint(point: { x: number; y: number }, center: { x: number; y: number }, zoom: number) {
  return {
    x: VIEWBOX.width / 2 + (point.x - center.x) * zoom,
    y: VIEWBOX.height / 2 + (point.y - center.y) * zoom
  };
}

function Tooltip({
  region,
  center,
  zoom
}: {
  region: ProjectedRegion;
  center: { x: number; y: number };
  zoom: number;
}) {
  const point = getTransformPoint(region.projected, center, zoom);
  const x = Math.min(point.x + 16, VIEWBOX.width - 252);
  const y = Math.max(point.y - 78, 18);

  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <rect width="236" height="72" rx="8" fill="#0B2430" stroke="rgba(148, 163, 184, 0.28)" />
      <text x="14" y="24" fill="#F8FAFC" fontSize="14" fontWeight="700">
        {region.name}
      </text>
      <text x="14" y="43" fill="#94A3B8" fontSize="11" fontWeight="600">
        {region.region}
      </text>
      <text x="14" y="60" fill="#7BD2D0" fontSize="10.5" fontWeight="700">
        {region.projectCount} proje · {region.stats[0]?.value ?? region.beneficiaryEstimate}
      </text>
    </g>
  );
}

function RegionMarker({
  region,
  active,
  onSelect,
  onHover,
  onLeave
}: {
  region: ProjectedRegion;
  active: boolean;
  onSelect: (slug: ProjectRegion["slug"]) => void;
  onHover: (slug: ProjectRegion["slug"]) => void;
  onLeave: () => void;
}) {
  const radius = getMarkerRadius(region);

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${region.name} çalışma bölgesini seç`}
      className="cursor-pointer outline-none"
      transform={`translate(${region.projected.x} ${region.projected.y})`}
      onClick={() => onSelect(region.slug)}
      onMouseEnter={() => onHover(region.slug)}
      onMouseLeave={onLeave}
      onFocus={() => onHover(region.slug)}
      onBlur={onLeave}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(region.slug);
        }
      }}
    >
      <circle r={active ? radius + 11 : radius + 7} fill="#1F8083" opacity={active ? 0.18 : 0.12} />
      <circle r={radius + 2.4} fill="#061923" stroke={active ? "#7BD2D0" : "#4BA9AA"} strokeWidth={active ? 2 : 1.5} />
      <circle r={radius * 0.48} fill={active ? "#7BD2D0" : "#1F8083"} />
      <text
        x="13"
        y="-8"
        fill={active ? "#F8FAFC" : "#CBD5E1"}
        fontSize={active ? 11.5 : 10}
        fontWeight="700"
        paintOrder="stroke"
        stroke="#061923"
        strokeWidth="3"
      >
        {region.name}
      </text>
    </g>
  );
}

export function ProjectRegionMap({ regions, activeRegionSlug, onSelect, compact = false }: ProjectRegionMapProps) {
  const [zoom, setZoom] = useState(compact ? 1.18 : 1.28);
  const [focused, setFocused] = useState(true);
  const [hoveredRegionSlug, setHoveredRegionSlug] = useState<ProjectRegion["slug"] | null>(null);

  const geo = useMemo(() => createRegionGeo(VIEWBOX.width, VIEWBOX.height), []);
  const projectedRegions = useMemo<ProjectedRegion[]>(
    () =>
      regions
        .map((region) => {
          const projected = geo.project(region.coords);
          if (!projected) return null;

          return {
            ...region,
            projected: { x: projected[0], y: projected[1] }
          };
        })
        .filter(Boolean) as ProjectedRegion[],
    [geo, regions]
  );

  const activeRegion = projectedRegions.find((region) => region.slug === activeRegionSlug) ?? projectedRegions[0];
  const hoveredRegion = projectedRegions.find((region) => region.slug === hoveredRegionSlug);
  const defaultCenter = { x: VIEWBOX.width / 2, y: VIEWBOX.height / 2 };
  const center = focused && activeRegion ? activeRegion.projected : defaultCenter;
  const mapTransform = `translate(${VIEWBOX.width / 2} ${VIEWBOX.height / 2}) scale(${zoom}) translate(${-center.x} ${-center.y})`;

  return (
    <div className={cn("relative min-w-0 overflow-hidden rounded-lg border border-[#DDE8E7] bg-[#08202A]", compact ? "h-[320px] sm:h-[360px] lg:h-[400px]" : "h-[340px] sm:h-[420px] lg:h-[460px]")}>
      <div className="absolute left-4 top-4 z-20 rounded-md border border-white/10 bg-[#0B2430]/82 px-3 py-2 backdrop-blur">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#B9E2E1]">Yardım Çalışmaları Haritası</p>
        <p className="mt-1 text-xs font-medium text-[#CBD5E1]">Seçili bölgeyi harita üzerinde inceleyin</p>
      </div>

      <ProjectRegionZoomControls
        zoom={zoom}
        onZoomIn={() => setZoom((value) => Math.min(3, Number((value + 0.18).toFixed(2))))}
        onZoomOut={() => setZoom((value) => Math.max(0.92, Number((value - 0.18).toFixed(2))))}
        onFocusRegion={() => {
          setFocused(true);
          setZoom(compact ? 1.36 : 1.62);
        }}
        onReset={() => {
          setFocused(false);
          setZoom(1);
        }}
      />

      <svg
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role="img"
        aria-label="Türkiye, Gazze, Lübnan ve Mısır çalışma bölgelerini gerçek ülke silüetleriyle gösteren harita"
        className="h-full w-full"
      >
        <defs>
          <radialGradient id="geoOcean" cx="48%" cy="38%" r="78%">
            <stop offset="0%" stopColor="#12323E" />
            <stop offset="62%" stopColor="#0B2430" />
            <stop offset="100%" stopColor="#08202A" />
          </radialGradient>
          <filter id="geoMarkerShadow" x="-70%" y="-70%" width="240%" height="240%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.34" />
          </filter>
        </defs>

        <rect width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#geoOcean)" />
        {geo.graticulePath ? (
          <path d={geo.graticulePath} fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="0.8" />
        ) : null}

        <g transform={mapTransform}>
          {geo.countries.map((country) => {
            const countryPath = geo.path(country);
            if (!countryPath) return null;
            const activeCountry = isActiveRegionCountry(country);

            return (
              <path
                key={String(country.id)}
                d={countryPath}
                fill={activeCountry ? "#1B4250" : "#14313D"}
                stroke={activeCountry ? "rgba(185, 226, 225, 0.36)" : "rgba(203, 213, 225, 0.18)"}
                strokeWidth={activeCountry ? 0.9 : 0.65}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {activeRegion ? (
            <circle
              cx={activeRegion.projected.x}
              cy={activeRegion.projected.y}
              r="42"
              fill="none"
              stroke="rgba(123, 210, 208, 0.36)"
              strokeWidth="1.1"
              strokeDasharray="4 9"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          <g filter="url(#geoMarkerShadow)">
            {projectedRegions.map((region) => (
              <RegionMarker
                key={region.slug}
                region={region}
                active={region.slug === activeRegionSlug}
                onSelect={(slug) => {
                  setFocused(true);
                  setZoom(compact ? 1.36 : 1.62);
                  onSelect(slug);
                }}
                onHover={setHoveredRegionSlug}
                onLeave={() => setHoveredRegionSlug(null)}
              />
            ))}
          </g>
        </g>

        {hoveredRegion ? <Tooltip region={hoveredRegion} center={center} zoom={zoom} /> : null}
      </svg>
    </div>
  );
}
