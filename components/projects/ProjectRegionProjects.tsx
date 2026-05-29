import type { Project } from "@/data/projects";
import type { ProjectRegion } from "@/data/projectRegions";
import { ProjectCard } from "@/components/ProjectCard";

export function ProjectRegionProjects({
  region,
  projects,
  compact = false
}: {
  region: ProjectRegion;
  projects: Project[];
  compact?: boolean;
}) {
  const visibleProjects = projects.filter((project) => project.regionSlug === region.slug || region.relatedProjectSlugs.includes(project.slug));

  return (
    <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ocean-green">{region.country}</p>
          <h3 className="mt-1 text-2xl font-extrabold text-dark-navy">{region.name}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">{region.shortDescription}</p>
        </div>
        <div className="rounded-xl bg-soft-blue px-3 py-2 text-sm font-extrabold text-deep-blue">
          {region.beneficiaryEstimate}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {region.focusAreas.map((area) => (
          <span key={area} className="rounded-full bg-mint-green px-3 py-1 text-xs font-extrabold text-dark-navy">
            {area}
          </span>
        ))}
      </div>
      <div className={compact ? "mt-5 grid gap-4 md:grid-cols-2" : "mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"}>
        {visibleProjects.length ? (
          visibleProjects.slice(0, compact ? 2 : 3).map((project) => (
            <ProjectCard key={project.slug} {...project} compact={compact} />
          ))
        ) : (
          <div className="rounded-xl border border-border-soft bg-soft-gray p-4 text-sm font-semibold leading-6 text-ink-muted md:col-span-2">
            Bu bölge için yayınlanan proje bilgisi hazırlanıyor.
          </div>
        )}
      </div>
    </div>
  );
}
