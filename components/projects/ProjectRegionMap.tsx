import type { ProjectRegion } from "@/data/projectRegions";
import { cn } from "@/lib/utils";

export function ProjectRegionMap({
  regions,
  activeRegionSlug,
  onSelect,
  compact = false
}: {
  regions: ProjectRegion[];
  activeRegionSlug: string;
  onSelect: (slug: ProjectRegion["slug"]) => void;
  compact?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-[#f7fbfb] shadow-card">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_22%,rgba(31,128,131,0.12),transparent_28%),radial-gradient(circle_at_78%_70%,rgba(15,37,71,0.08),transparent_30%)]" />
      <svg
        viewBox="0 0 720 420"
        role="img"
        aria-label="Okyanus çalışma bölgeleri haritası"
        className={cn("relative w-full", compact ? "h-[18rem]" : "h-[24rem]")}
      >
        <defs>
          <linearGradient id="regionSea" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#EAF6F6" />
            <stop offset="100%" stopColor="#DDEBF1" />
          </linearGradient>
          <filter id="regionShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0F2547" floodOpacity="0.12" />
          </filter>
        </defs>
        <rect width="720" height="420" fill="url(#regionSea)" />

        <path d="M95 65 C155 40 240 52 305 92 C342 116 372 140 420 138 C468 136 508 110 565 124 C622 138 660 186 678 238 C640 220 594 219 550 235 C492 256 438 286 374 270 C314 255 278 214 224 202 C166 189 116 210 70 238 C52 174 54 94 95 65Z" fill="#E8F1F3" stroke="#C9D8E1" strokeWidth="2" filter="url(#regionShadow)" />
        <path d="M400 112 C430 92 480 78 526 89 C557 96 578 118 590 148 C558 146 526 152 496 166 C458 184 424 189 390 176 C364 166 344 148 324 128 C350 129 378 126 400 112Z" fill="#F8FBFB" stroke="#C8D7DF" strokeWidth="1.8" />
        <path d="M430 186 C462 178 496 181 520 202 C546 225 552 260 542 294 C514 282 485 276 452 282 C422 288 390 305 358 300 C370 264 390 207 430 186Z" fill="#F8FBFB" stroke="#C8D7DF" strokeWidth="1.8" />
        <path d="M305 188 C342 182 377 194 397 222 C366 237 340 260 323 294 C290 282 260 260 244 228 C256 207 278 194 305 188Z" fill="#F8FBFB" stroke="#C8D7DF" strokeWidth="1.8" />
        <path d="M500 88 C540 70 595 75 636 102" fill="none" stroke="#AFC7D2" strokeWidth="2" strokeDasharray="6 8" />
        <path d="M226 246 C286 224 350 223 418 250 C475 273 532 272 602 248" fill="none" stroke="#9FC0C9" strokeWidth="1.5" strokeDasharray="4 9" opacity="0.7" />

        {regions.map((region) => {
          const active = region.slug === activeRegionSlug;
          const x = (region.mapPosition.x / 100) * 720;
          const y = (region.mapPosition.y / 100) * 420;
          return (
            <g key={region.slug}>
              <circle cx={x} cy={y} r={active ? 24 : 18} fill={active ? "#1F8083" : "#FFFFFF"} stroke="#1F8083" strokeWidth={active ? 5 : 3} opacity={active ? 0.2 : 0.55} />
              <g
                role="button"
                tabIndex={0}
                onClick={() => onSelect(region.slug)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") onSelect(region.slug);
                }}
                aria-label={`${region.name} bölgesini seç`}
                className="cursor-pointer outline-none"
              >
                <circle cx={x} cy={y} r={active ? 10 : 8} fill={active ? "#0F2547" : "#1F8083"} stroke="#FFFFFF" strokeWidth="3" />
              </g>
              <text
                x={x + 14}
                y={y - 12}
                fill="#0F2547"
                fontSize={active ? 17 : 14}
                fontWeight="800"
              >
                {region.name}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="relative border-t border-border-soft bg-white/82 px-4 py-3 text-xs font-bold leading-5 text-ink-muted">
        Harita gösterimi operasyonel bölge anlatımı içindir; coğrafi ölçekte birebir sınır haritası değildir.
      </div>
    </div>
  );
}
