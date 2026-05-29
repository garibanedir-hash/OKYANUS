import type { ProjectRegion } from "@/data/projectRegions";
import { cn } from "@/lib/utils";

export function ProjectRegionCard({
  region,
  active,
  projectCount,
  onSelect
}: {
  region: ProjectRegion;
  active?: boolean;
  projectCount?: number;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "focus-ring group relative overflow-hidden rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-[#9FB8C4] hover:shadow-card",
        active ? "border-[#1F8083] shadow-card ring-1 ring-[#1F8083]/20" : "border-[#D7E0E7]"
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1", active ? "bg-[#1F8083]" : "bg-[#D7E0E7]")} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[#1F8083]">{region.country}</p>
          <p className="mt-1 text-lg font-extrabold text-[#0F2547]">{region.name}</p>
          <p className="mt-1 text-xs font-bold leading-5 text-[#64748B]">{region.regionLabel}</p>
        </div>
        <span className={cn("rounded-md px-2.5 py-1 text-[0.68rem] font-extrabold", active ? "bg-[#0F2547] text-white" : "bg-[#EEF4F6] text-[#0F2547]")}>
          {projectCount ?? region.activeProjectCount} proje
        </span>
      </div>
      <p className="mt-3 line-clamp-3 pl-2 text-sm leading-6 text-[#526574]">{region.shortDescription}</p>
      <div className="mt-4 flex flex-wrap gap-1.5 pl-2">
        {region.focusAreas.slice(0, 3).map((area) => (
          <span key={area} className="rounded-md bg-[#F4F7F8] px-2 py-1 text-[0.68rem] font-bold text-[#526574]">
            {area}
          </span>
        ))}
      </div>
    </button>
  );
}
