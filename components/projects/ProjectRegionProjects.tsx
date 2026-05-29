import type { Project } from "@/data/projects";
import type { ProjectRegion } from "@/data/projectRegions";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/Button";

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
    <div className="rounded-lg border border-[#D7E0E7] bg-white p-5 shadow-card">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#1F8083]">Bölgedeki Projeler</p>
          <h3 className="mt-2 text-2xl font-extrabold text-[#0F2547]">{region.name} çalışma hattı</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#526574]">{region.shortDescription}</p>
        </div>
        <div className="grid gap-2 rounded-lg border border-[#D7E0E7] bg-[#F8FAFB] p-4">
          <div>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#64748B]">Tahmini etki</p>
            <p className="mt-1 text-lg font-extrabold text-[#0F2547]">{region.beneficiaryEstimate}</p>
          </div>
          <Button href="/projeler" variant="ghost" className="mt-1 min-h-9 rounded-md px-3 py-2 text-xs" showIcon>
            Tümünü Gör
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {region.focusAreas.map((area) => (
          <span key={area} className="rounded-md border border-[#D7E0E7] bg-[#F4F7F8] px-3 py-1 text-xs font-extrabold text-[#0F2547]">
            {area}
          </span>
        ))}
      </div>

      <div className={compact ? "mt-6 grid gap-4 md:grid-cols-2" : "mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"}>
        {visibleProjects.length ? (
          visibleProjects.slice(0, compact ? 2 : 3).map((project) => (
            <ProjectCard key={project.slug} {...project} compact={compact} />
          ))
        ) : (
          <div className="rounded-lg border border-[#D7E0E7] bg-[#F8FAFB] p-4 text-sm font-semibold leading-6 text-[#526574] md:col-span-2">
            Bu bölge için yayınlanan proje bilgisi hazırlanıyor.
          </div>
        )}
      </div>
    </div>
  );
}
