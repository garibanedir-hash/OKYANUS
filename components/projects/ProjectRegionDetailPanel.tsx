import type { Project } from "@/data/projects";
import type { ProjectRegion } from "@/data/projectRegions";
import { projectRegionCategoryIconPaths, projectRegionCategoryLabels } from "@/data/projectRegions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ProjectRegionDetailPanelProps = {
  region: ProjectRegion;
  projects: Project[];
  compact?: boolean;
};

export function ProjectRegionDetailPanel({
  region,
  projects,
  compact = false
}: ProjectRegionDetailPanelProps) {
  const visibleProjects = projects.filter((project) => project.regionSlug === region.slug || region.relatedProjectSlugs.includes(project.slug));
  const projectCount = visibleProjects.length || region.projectCount;

  return (
    <aside className="min-w-0 rounded-lg border border-[#DDE8E7] bg-white p-4 text-[#0F2547] shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-[#DDE8E7] pb-4">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#1F8083]">Seçili Bölge</p>
          <h3 className="mt-2 text-2xl font-bold leading-tight text-[#0F2547]">{region.name}</h3>
          <p className="mt-1 text-sm font-medium leading-5 text-[#64748B]">{region.country} / {region.region}</p>
        </div>
        <div className="shrink-0 rounded border border-[#1F8083]/25 bg-[#F4F8F7] px-3 py-2 text-right">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[#1F8083]">Proje</p>
          <p className="text-lg font-semibold text-[#0F2547]">{projectCount}</p>
        </div>
      </div>

      {region.coverImageUrl ? (
        <div className="mt-4 h-28 overflow-hidden rounded-md border border-[#DDE8E7] bg-[#EEF4F3]">
          <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url("${region.coverImageUrl}")` }} aria-label={`${region.name} bölge görseli`} />
        </div>
      ) : null}

      <p className="mt-4 text-sm font-semibold leading-6 text-[#0F2547]">{region.tagline}</p>
      <p className="mt-2 line-clamp-5 text-sm leading-6 text-[#64748B]">{region.description}</p>

      <dl className={cn("mt-5 grid gap-2", compact ? "grid-cols-1 sm:grid-cols-3 xl:grid-cols-1" : "grid-cols-1")}>
        {region.stats.slice(0, 3).map((stat) => (
          <div key={`${region.slug}-${stat.label}`} className="rounded border border-[#DDE8E7] bg-[#F8FBFA] p-3">
            <dt className="text-[0.62rem] font-bold uppercase tracking-[0.08em] text-[#64748B]">{stat.label}</dt>
            <dd className="mt-1 text-sm font-semibold text-[#0F2547]">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#64748B]">Odak Alanları</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {region.categories.map((category) => (
            <span
              key={`${region.slug}-${category}`}
              className="inline-flex items-center gap-1.5 rounded border border-[#1F8083]/20 bg-[#F4F8F7] px-2.5 py-1 text-[0.68rem] font-semibold text-[#0F2547]"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-[#1F8083] stroke-[1.8]">
                <path d={projectRegionCategoryIconPaths[category]} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {projectRegionCategoryLabels[category]}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded border border-[#DDE8E7] bg-[#FAFBF8] p-3">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#64748B]">Çalışma Yaklaşımı</p>
        <p className="mt-1 text-sm font-medium leading-5 text-[#0F2547]">{region.operatingModel}</p>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Button href="/projeler" variant="light" className="rounded-md text-xs" showIcon>
          Projeleri Gör
        </Button>
        <Button href="/bagis-yap" className="rounded-md text-xs" showIcon>
          Bağış Yap
        </Button>
      </div>
    </aside>
  );
}
