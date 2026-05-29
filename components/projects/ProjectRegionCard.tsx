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
        "focus-ring group overflow-hidden rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-card",
        active ? "border-ocean-green ring-2 ring-ocean-green/20" : "border-border-soft"
      )}
    >
      <div className={cn("h-1.5 rounded-full bg-gradient-to-r", region.coverTone)} />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-extrabold text-dark-navy">{region.name}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-ocean-green">{region.regionLabel}</p>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold", active ? "bg-ocean-green text-white" : "bg-soft-blue text-deep-blue")}>
          {projectCount ?? region.activeProjectCount} proje
        </span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-muted">{region.shortDescription}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {region.focusAreas.slice(0, 3).map((area) => (
          <span key={area} className="rounded-full bg-soft-gray px-2 py-1 text-[0.68rem] font-bold text-ink-muted">
            {area}
          </span>
        ))}
      </div>
    </button>
  );
}
