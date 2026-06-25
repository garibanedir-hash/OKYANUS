import Link from "next/link";
import type { Project } from "@/data/projects";
import type { PublicProjectActivity } from "@/data/projectActivityMock";
import type { ProjectRegion } from "@/data/projectRegions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function formatActivityDate(value?: string) {
  if (!value) return "Saha güncellemesi";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export function ProjectRegionProjects({
  region,
  projects,
  activities = [],
  compact = false
}: {
  region: ProjectRegion;
  projects: Project[];
  activities?: PublicProjectActivity[];
  compact?: boolean;
}) {
  const visibleProjects = projects.filter((project) => project.regionSlug === region.slug || region.relatedProjectSlugs.includes(project.slug));
  const visibleProjectIds = new Set(visibleProjects.map((project) => project.id));
  const visibleActivities = activities.filter((activity) => visibleProjectIds.has(activity.projectId));
  const projectById = new Map(visibleProjects.map((project) => [project.id, project]));

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
      <section className="min-w-0 rounded-xl border border-[#DDE8E7] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#1F8083]">Bu Bölgede Yürütülen Projeler</p>
            <h3 className="mt-2 text-2xl font-bold text-[#0F2547]">{region.name} çalışmaları</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748B]">{region.shortDescription}</p>
          </div>
          <Button href="/projeler" variant="ghost" className="min-h-9 shrink-0 rounded-md px-3 py-2 text-xs" showIcon>
            Tüm Projeler
          </Button>
        </div>

        <div className={cn("mt-5 grid gap-4", compact ? "md:grid-cols-2" : "md:grid-cols-2")}>
          {visibleProjects.length ? (
            visibleProjects.slice(0, compact ? 2 : 4).map((project) => {
              const imageUrl = project.thumbnailUrl || project.coverImageUrl || region.coverImageUrl;
              return (
              <article
                key={project.slug}
                className="group grid min-w-0 gap-4 rounded-lg border border-[#DDE8E7] bg-[#F8FBFA] p-3 transition hover:-translate-y-0.5 hover:border-[#1F8083]/35 hover:bg-white hover:shadow-card sm:grid-cols-[7.5rem_minmax(0,1fr)]"
              >
                <div className="relative min-h-28 overflow-hidden rounded-md border border-[#DDE8E7] bg-white">
                  {imageUrl ? (
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${imageUrl}")` }} aria-hidden />
                  ) : (
                    <div className="flex h-full min-h-28 flex-col items-center justify-center gap-2 bg-[#EEF4F3] px-4 text-center text-[#0F2547]">
                      <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-[#1F8083] stroke-[1.8]">
                        <path d="M4 19.5V8.8L12 4l8 4.8v10.7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 20v-7h8v7M9 9.5h.01M15 9.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-[0.68rem] font-bold leading-4">Proje görseli paylaşılmadı</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-white px-2.5 py-1 text-[0.68rem] font-bold text-[#1F8083]">
                      {project.category}
                    </span>
                    {project.status ? (
                      <span className="rounded-md bg-white px-2.5 py-1 text-[0.68rem] font-bold text-[#64748B]">
                        {project.status}
                      </span>
                    ) : null}
                    {project.regionName ? (
                      <span className="rounded-md bg-white px-2.5 py-1 text-[0.68rem] font-bold text-[#64748B]">
                        {project.regionName}
                      </span>
                    ) : null}
                  </div>
                  <h4 className="mt-3 text-base font-bold leading-6 text-[#0F2547]">{project.title}</h4>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#64748B]">{project.summary || project.description}</p>
                  <Link href={`/projeler/${project.slug}`} className="mt-4 inline-flex min-h-9 items-center justify-center rounded-md bg-[#1F8083] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0F2547]">
                    Projeyi İncele
                  </Link>
                </div>
              </article>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-[#BFD2D1] bg-[#F8FBFA] p-5 text-sm font-medium leading-6 text-[#64748B] md:col-span-2">
              Bu bölgeye bağlı proje eklendiğinde burada görünecek.
            </div>
          )}
        </div>
      </section>

      <section className="min-w-0 rounded-xl border border-[#DDE8E7] bg-white p-5 shadow-sm">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#1F8083]">Son Saha Faaliyetleri</p>
        <h3 className="mt-2 text-2xl font-bold text-[#0F2547]">Bölge güncellemeleri</h3>
        <div className="mt-5 grid gap-3">
          {visibleActivities.length ? (
            visibleActivities.slice(0, 3).map((activity) => (
              <article key={activity.id} className="grid min-w-0 gap-3 rounded-lg border border-[#DDE8E7] bg-[#FAFBF8] p-3 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                <div className="relative min-h-24 overflow-hidden rounded-md border border-[#DDE8E7] bg-white">
                  {activity.coverImageUrl ? (
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${activity.coverImageUrl}")` }} aria-hidden />
                  ) : (
                    <div className="flex h-full min-h-24 items-center justify-center bg-[#EEF4F3] text-[#1F8083]">
                      <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-[1.8]">
                        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#64748B]">{formatActivityDate(activity.activityDate ?? activity.completedAt ?? activity.publishedAt)}</p>
                  <h4 className="mt-2 text-sm font-bold leading-6 text-[#0F2547]">{activity.title}</h4>
                  <p className="mt-1 text-sm leading-6 text-[#64748B]">
                    {activity.publicSummary ?? activity.distributedItemType ?? "Bu faaliyet için saha özeti paylaşılmadı."}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {projectById.get(activity.projectId) ? (
                      <span className="rounded-md bg-white px-2.5 py-1 text-[0.68rem] font-bold text-[#0F2547]">
                        {projectById.get(activity.projectId)?.title}
                      </span>
                    ) : null}
                  </div>
                  {projectById.get(activity.projectId)?.slug ? (
                    <Link href={`/projeler/${projectById.get(activity.projectId)?.slug}`} className="mt-3 inline-flex text-sm font-bold text-[#1F8083] hover:text-[#0F2547]">
                      Projeyi Gör
                    </Link>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-[#BFD2D1] bg-[#F8FBFA] p-5 text-sm font-medium leading-6 text-[#64748B]">
              Bu bölge için henüz yayınlanmış saha faaliyeti bulunmuyor.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
