"use client";

import type { ProjectRegion } from "@/data/projectRegions";
import { cn } from "@/lib/utils";

type ProjectRegionListProps = {
  regions: ProjectRegion[];
  activeRegionSlug: ProjectRegion["slug"];
  projectCountByRegion: Record<string, number>;
  onSelect: (slug: ProjectRegion["slug"]) => void;
  compact?: boolean;
};

export function ProjectRegionList({
  regions,
  activeRegionSlug,
  projectCountByRegion,
  onSelect,
  compact = false
}: ProjectRegionListProps) {
  return (
    <aside
      className={cn(
        "rounded-lg border border-white/10 bg-[#071C28]/95 p-3 text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.25)]",
        compact ? "grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-1" : "grid gap-2"
      )}
      aria-label="Çalışılan bölgeler"
    >
      <div className={cn("px-2 pb-2", compact ? "col-span-2 md:col-span-4 xl:col-span-1" : "")}>
        <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-[#75C9C9]">Çalıştığımız Bölgeler</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-[#A5B8C4]">Saha hattı seçin, harita ve proje verisi güncellensin.</p>
      </div>

      {regions.map((region) => {
        const active = region.slug === activeRegionSlug;
        const projectCount = projectCountByRegion[region.slug] ?? region.projectCount;

        return (
          <button
            key={region.slug}
            type="button"
            onClick={() => onSelect(region.slug)}
            aria-pressed={active}
            className={cn(
              "group relative overflow-hidden rounded-md border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F8083]",
              active
                ? "border-[#1F8083]/70 bg-[#0F2547] shadow-[0_16px_36px_rgba(31,128,131,0.2)]"
                : "border-white/10 bg-white/[0.035] hover:border-[#1F8083]/45 hover:bg-white/[0.065]"
            )}
          >
            <span
              className={cn(
                "absolute inset-y-3 left-0 w-0.5 rounded-r-full",
                active ? "bg-[#E8B04B]" : "bg-[#1F8083]/45"
              )}
            />
            <span className="flex items-start justify-between gap-3 pl-2">
              <span>
                <span className="block text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-[#75C9C9]">
                  {region.country}
                </span>
                <span className="mt-1 block text-base font-extrabold leading-tight text-white">{region.name}</span>
                <span className="mt-1 block text-xs font-semibold leading-5 text-[#A5B8C4]">{region.region}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded px-2 py-1 text-[0.64rem] font-extrabold",
                  active ? "bg-[#E8B04B] text-[#07121B]" : "bg-white/10 text-slate-200"
                )}
              >
                {projectCount}
              </span>
            </span>
          </button>
        );
      })}
    </aside>
  );
}
