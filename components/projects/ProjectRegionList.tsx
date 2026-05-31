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
        "rounded-lg border border-[#DDE8E7] bg-white p-2.5 text-[#0F2547] shadow-sm",
        compact ? "grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-1" : "grid gap-1.5"
      )}
      aria-label="Çalışılan bölgeler"
    >
      <div className={cn("px-2 pb-2", compact ? "col-span-2 md:col-span-4 xl:col-span-1" : "")}>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#1F8083]">Çalışılan Bölgeler</p>
        <p className="mt-1 text-xs font-medium leading-5 text-[#64748B]">Bölge seçerek projeleri ve saha notlarını inceleyin.</p>
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
              "group relative overflow-hidden rounded-md border px-3 py-2.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F8083]",
              active
                ? "border-[#1F8083]/45 bg-[#F4F8F7]"
                : "border-transparent bg-transparent hover:border-[#DDE8E7] hover:bg-[#F8FBFA]"
            )}
          >
            <span
              className={cn(
                "absolute inset-y-2 left-0 w-0.5 rounded-r-full",
                active ? "bg-[#1F8083]" : "bg-[#DDE8E7]"
              )}
            />
            <span className="flex items-center justify-between gap-3 pl-2">
              <span>
                <span className="block text-[0.6rem] font-bold uppercase tracking-[0.1em] text-[#1F8083]">
                  {region.country}
                </span>
                <span className="mt-0.5 block text-sm font-semibold leading-tight text-[#0F2547]">{region.name}</span>
                <span className="mt-0.5 block truncate text-xs font-medium leading-5 text-[#64748B]">{region.region}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded px-2 py-1 text-[0.62rem] font-bold",
                  active ? "bg-[#1F8083] text-white" : "bg-[#EEF4F3] text-[#0F2547]"
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
