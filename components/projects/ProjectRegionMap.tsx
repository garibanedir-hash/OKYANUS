"use client";

import { useMemo, useState } from "react";
import type { ProjectRegion } from "@/data/projectRegions";
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

const VIEWBOX = { width: 780, height: 460 };
const GEO_BOUNDS = {
  minLon: 24,
  maxLon: 44,
  minLat: 25,
  maxLat: 42
};

function projectCoords([longitude, latitude]: ProjectRegion["coords"]) {
  const x = ((longitude - GEO_BOUNDS.minLon) / (GEO_BOUNDS.maxLon - GEO_BOUNDS.minLon)) * VIEWBOX.width;
  const y = ((GEO_BOUNDS.maxLat - latitude) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) * VIEWBOX.height;

  return {
    x: Math.max(28, Math.min(VIEWBOX.width - 28, x)),
    y: Math.max(28, Math.min(VIEWBOX.height - 28, y))
  };
}

function Tooltip({ region }: { region: ProjectedRegion }) {
  const x = Math.min(region.projected.x + 18, VIEWBOX.width - 248);
  const y = Math.max(region.projected.y - 74, 18);

  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <rect width="230" height="68" rx="8" fill="#061824" stroke="#1F8083" strokeOpacity="0.7" />
      <text x="14" y="23" fill="#FFFFFF" fontSize="15" fontWeight="800">
        {region.name}
      </text>
      <text x="14" y="42" fill="#9DB7C5" fontSize="11" fontWeight="700">
        {region.country} / {region.region}
      </text>
      <text x="14" y="58" fill="#75C9C9" fontSize="10.5" fontWeight="800">
        {region.projectCount} aktif proje hattı
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
  const { x, y } = region.projected;
  const radius = 7 + Math.min(7, region.projectCount * 0.5);

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${region.name} çalışma bölgesini seç`}
      className="cursor-pointer outline-none"
      transform={`translate(${x} ${y})`}
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
      <circle r={active ? radius + 15 : radius + 9} fill={active ? "#E8B04B" : "#1F8083"} opacity={active ? 0.16 : 0.1} />
      <circle r={active ? radius + 4 : radius + 1} fill="#061824" stroke={active ? "#E8B04B" : "#75C9C9"} strokeWidth={active ? 2.2 : 1.6} />
      <circle r={radius * 0.48} fill={active ? "#E8B04B" : "#75C9C9"} />
      <path d="M-19 0H-11M11 0H19M0-19V-11M0 11V19" stroke={active ? "#E8B04B" : "#75C9C9"} strokeWidth="1.1" opacity="0.9" />
      <text
        x="15"
        y={active ? -11 : -9}
        fill={active ? "#FFFFFF" : "#C7D7DF"}
        fontSize={active ? 12 : 10.5}
        fontWeight="800"
        paintOrder="stroke"
        stroke="#061824"
        strokeWidth="3"
      >
        {region.name}
      </text>
    </g>
  );
}

export function ProjectRegionMap({ regions, activeRegionSlug, onSelect, compact = false }: ProjectRegionMapProps) {
  const [zoom, setZoom] = useState(1);
  const [hoveredRegionSlug, setHoveredRegionSlug] = useState<ProjectRegion["slug"] | null>(null);

  const projectedRegions = useMemo<ProjectedRegion[]>(
    () => regions.map((region) => ({ ...region, projected: projectCoords(region.coords) })),
    [regions]
  );

  const hoveredRegion = projectedRegions.find((region) => region.slug === hoveredRegionSlug);
  const activeRegion = projectedRegions.find((region) => region.slug === activeRegionSlug);

  const mapTransform = `translate(${VIEWBOX.width / 2} ${VIEWBOX.height / 2}) scale(${zoom}) translate(${-VIEWBOX.width / 2} ${-VIEWBOX.height / 2})`;

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-white/10 bg-[#04121A]", compact ? "min-h-[24rem]" : "min-h-[31rem]")}>
      <div className="absolute left-4 top-4 z-20 rounded-md border border-white/10 bg-[#061824]/85 px-3 py-2 backdrop-blur">
        <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-[#75C9C9]">Okyanus Operasyon Haritası</p>
        <p className="mt-1 text-xs font-semibold text-[#9DB7C5]">Doğu Akdeniz / yakın coğrafya viewport</p>
      </div>

      <ProjectRegionZoomControls
        zoom={zoom}
        onZoomIn={() => setZoom((value) => Math.min(1.9, Number((value + 0.18).toFixed(2))))}
        onZoomOut={() => setZoom((value) => Math.max(0.82, Number((value - 0.18).toFixed(2))))}
        onFocusRegion={() => setZoom(1.46)}
        onReset={() => setZoom(1)}
      />

      <svg
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role="img"
        aria-label="Gazze, Lübnan, Mısır ve Türkiye çalışma bölgelerini gösteren operasyon haritası"
        className="h-full min-h-[24rem] w-full"
      >
        <defs>
          <radialGradient id="okyanusMapGlow" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#123044" />
            <stop offset="58%" stopColor="#071C28" />
            <stop offset="100%" stopColor="#04121A" />
          </radialGradient>
          <linearGradient id="okyanusLand" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#1A3544" />
            <stop offset="100%" stopColor="#0B2534" />
          </linearGradient>
          <linearGradient id="okyanusActiveLand" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#1F8083" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#E8B04B" stopOpacity="0.12" />
          </linearGradient>
          <pattern id="okyanusGrid" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M52 0H0V52" fill="none" stroke="#7EA0B0" strokeOpacity="0.09" strokeWidth="0.8" />
          </pattern>
          <filter id="markerShadow" x="-70%" y="-70%" width="240%" height="240%">
            <feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        <rect width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#okyanusMapGlow)" />
        <rect width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#okyanusGrid)" />

        <g opacity="0.38">
          {[120, 220, 320, 420, 520, 620].map((x) => (
            <path key={`lon-${x}`} d={`M${x} 32V428`} stroke="#A6BDCA" strokeWidth="0.7" strokeDasharray="3 11" />
          ))}
          {[88, 168, 248, 328, 408].map((y) => (
            <path key={`lat-${y}`} d={`M36 ${y}H744`} stroke="#A6BDCA" strokeWidth="0.7" strokeDasharray="3 11" />
          ))}
        </g>

        <g transform={mapTransform}>
          <path
            d="M86 62 C170 28 248 34 322 71 C382 101 444 104 523 70 C620 28 696 48 748 86 L748 8 L86 8Z"
            fill="url(#okyanusLand)"
            stroke="#315364"
            strokeWidth="1.2"
          />
          <path
            d="M258 86 C302 49 374 42 448 56 C526 70 588 109 659 126 C602 154 549 184 484 184 C419 183 363 151 311 127 C284 115 266 104 258 86Z"
            fill="url(#okyanusActiveLand)"
            stroke="#3E6475"
            strokeWidth="1.2"
          />
          <path
            d="M456 185 C500 161 558 170 606 207 C655 245 683 306 660 379 C618 353 562 340 506 350 C449 360 402 395 340 384 C354 316 386 215 456 185Z"
            fill="url(#okyanusLand)"
            stroke="#315364"
            strokeWidth="1.2"
          />
          <path
            d="M348 210 C394 191 434 201 470 232 C434 267 412 316 393 382 C334 366 290 329 264 276 C280 245 308 222 348 210Z"
            fill="#0A2331"
            stroke="#315364"
            strokeWidth="1.2"
          />
          <path
            d="M318 137 C351 120 392 123 421 145 C392 167 350 174 314 158 C306 149 307 141 318 137Z"
            fill="#0A2331"
            stroke="#315364"
            strokeWidth="1"
          />
          <path d="M448 180 C423 210 405 243 395 284 C388 315 376 348 354 383" fill="none" stroke="#5A7F8E" strokeOpacity="0.45" strokeWidth="1.1" />
          <path d="M438 188 C420 209 410 231 404 254" fill="none" stroke="#75C9C9" strokeOpacity="0.28" strokeWidth="1.1" />
          <path d="M336 219 C392 203 444 215 500 252 C552 286 601 293 660 276" fill="none" stroke="#75C9C9" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="6 10" />
          <path d="M214 318 C293 282 379 284 474 320 C566 354 646 341 720 304" fill="none" stroke="#75C9C9" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="6 12" />

          {activeRegion ? (
            <g opacity="0.7">
              <circle
                cx={activeRegion.projected.x}
                cy={activeRegion.projected.y}
                r="62"
                fill="none"
                stroke="#E8B04B"
                strokeWidth="1.2"
                strokeDasharray="4 10"
                opacity="0.45"
              />
              <path
                d={`M${activeRegion.projected.x} ${activeRegion.projected.y} C420 218 454 212 492 185`}
                fill="none"
                stroke="#E8B04B"
                strokeWidth="1.1"
                strokeDasharray="5 9"
              />
            </g>
          ) : null}

          <g filter="url(#markerShadow)">
            {projectedRegions.map((region) => (
              <RegionMarker
                key={region.slug}
                region={region}
                active={region.slug === activeRegionSlug}
                onSelect={onSelect}
                onHover={setHoveredRegionSlug}
                onLeave={() => setHoveredRegionSlug(null)}
              />
            ))}
          </g>

          {hoveredRegion ? <Tooltip region={hoveredRegion} /> : null}
        </g>

        <g transform="translate(34 395)">
          <text fill="#75C9C9" fontSize="10" fontWeight="800" letterSpacing="1.8">
            LIVE REGION VIEW
          </text>
          <text y="19" fill="#9DB7C5" fontSize="10" fontWeight="700">
            Koordinat işaretleri proje ve bölge eşleştirme verisiyle çalışır.
          </text>
        </g>
        <g transform="translate(704 60)" opacity="0.7">
          <text x="0" y="-9" fill="#9DB7C5" fontSize="10" fontWeight="800" textAnchor="middle">N</text>
          <path d="M0 0L9 25L0 19L-9 25Z" fill="#75C9C9" />
        </g>
      </svg>
    </div>
  );
}
