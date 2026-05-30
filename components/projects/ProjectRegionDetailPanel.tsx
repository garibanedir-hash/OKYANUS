import Link from "next/link";
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
    <aside className="rounded-lg border border-white/10 bg-[#081F2D]/95 p-5 text-slate-100 shadow-[0_24px_70px_rgba(0,0,0,0.3)]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-[#75C9C9]">Seçili Operasyon Hattı</p>
          <h3 className="mt-2 text-3xl font-extrabold leading-tight text-white">{region.name}</h3>
          <p className="mt-1 text-sm font-bold text-[#A5B8C4]">{region.country} / {region.region}</p>
        </div>
        <div className="rounded-md border border-[#E8B04B]/30 bg-[#E8B04B]/12 px-3 py-2 text-right">
          <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#F1C56F]">Proje</p>
          <p className="text-xl font-extrabold text-white">{projectCount}</p>
        </div>
      </div>

      <p className="mt-4 text-sm font-bold leading-6 text-[#E5EEF3]">{region.tagline}</p>
      <p className="mt-2 text-sm leading-6 text-[#A5B8C4]">{region.description}</p>

      <dl className={cn("mt-5 grid gap-2", compact ? "grid-cols-1 sm:grid-cols-3 xl:grid-cols-1" : "grid-cols-1")}>
        {region.stats.map((stat) => (
          <div key={`${region.slug}-${stat.label}`} className="rounded-md border border-white/10 bg-white/[0.045] p-3">
            <dt className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-[#75C9C9]">{stat.label}</dt>
            <dd className="mt-1 text-sm font-extrabold text-white">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[#A5B8C4]">Kategori</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {region.categories.map((category) => (
            <span
              key={`${region.slug}-${category}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#1F8083]/30 bg-[#1F8083]/12 px-2.5 py-1 text-[0.68rem] font-extrabold text-[#B9E2E1]"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-[#E8B04B] stroke-[1.8]">
                <path d={projectRegionCategoryIconPaths[category]} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {projectRegionCategoryLabels[category]}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-md border border-white/10 bg-[#061824] p-3">
        <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[#A5B8C4]">Çalışma Modeli</p>
        <p className="mt-1 text-sm font-bold leading-5 text-white">{region.operatingModel}</p>
      </div>

      <div className="mt-5 grid gap-2">
        {visibleProjects.slice(0, compact ? 2 : 3).map((project) => (
          <Link
            key={project.slug}
            href={`/projeler/${project.slug}`}
            className="group rounded-md border border-white/10 bg-white/[0.035] p-3 transition hover:border-[#1F8083]/50 hover:bg-white/[0.065]"
          >
            <span className="block text-sm font-extrabold text-white">{project.title}</span>
            <span className="mt-1 block text-xs font-semibold leading-5 text-[#A5B8C4]">{project.category}</span>
          </Link>
        ))}
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
