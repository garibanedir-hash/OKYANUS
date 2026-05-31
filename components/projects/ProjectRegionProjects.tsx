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

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
      <section className="rounded-xl border border-[#DDE8E7] bg-white p-5 shadow-sm">
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

        <div className={cn("mt-5 grid gap-3", compact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3")}>
          {visibleProjects.length ? (
            visibleProjects.slice(0, compact ? 2 : 3).map((project) => (
              <Link
                key={project.slug}
                href={`/projeler/${project.slug}`}
                className="group rounded-lg border border-[#DDE8E7] bg-[#F8FBFA] p-4 transition hover:-translate-y-0.5 hover:border-[#1F8083]/35 hover:bg-white hover:shadow-card"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-white px-2.5 py-1 text-[0.68rem] font-bold text-[#1F8083]">
                    {project.category}
                  </span>
                  {project.activityCount ? (
                    <span className="rounded-md bg-white px-2.5 py-1 text-[0.68rem] font-bold text-[#64748B]">
                      {project.activityCount} faaliyet
                    </span>
                  ) : null}
                </div>
                <h4 className="mt-3 text-base font-bold leading-6 text-[#0F2547]">{project.title}</h4>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#64748B]">{project.description}</p>
                <span className="mt-4 inline-flex text-sm font-bold text-[#1F8083] group-hover:text-[#0F2547]">
                  Detayları Gör
                </span>
              </Link>
            ))
          ) : (
            <div className="rounded-lg border border-[#DDE8E7] bg-[#F8FBFA] p-4 text-sm font-medium leading-6 text-[#64748B] md:col-span-2">
              Bu bölge için yayınlanan proje bilgisi hazırlanıyor.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[#DDE8E7] bg-white p-5 shadow-sm">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#1F8083]">Son Saha Faaliyetleri</p>
        <h3 className="mt-2 text-2xl font-bold text-[#0F2547]">Bölge güncellemeleri</h3>
        <div className="mt-5 grid gap-3">
          {visibleActivities.length ? (
            visibleActivities.slice(0, 3).map((activity) => (
              <article key={activity.id} className="rounded-lg border border-[#DDE8E7] bg-[#FAFBF8] p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#64748B]">{formatActivityDate(activity.activityDate ?? activity.completedAt ?? activity.publishedAt)}</p>
                <h4 className="mt-2 text-sm font-bold leading-6 text-[#0F2547]">{activity.title}</h4>
                <p className="mt-1 text-sm leading-6 text-[#64748B]">
                  {activity.publicSummary ?? activity.distributedItemType ?? "Bu faaliyet için public saha özeti hazırlanıyor."}
                </p>
              </article>
            ))
          ) : region.recentUpdates.length ? (
            region.recentUpdates.slice(0, 3).map((update) => (
              <article key={`${region.slug}-${update.title}`} className="rounded-lg border border-[#DDE8E7] bg-[#FAFBF8] p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#64748B]">{update.dateLabel}</p>
                <h4 className="mt-2 text-sm font-bold leading-6 text-[#0F2547]">{update.title}</h4>
                <p className="mt-1 text-sm leading-6 text-[#64748B]">{update.summary}</p>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-[#DDE8E7] bg-[#F8FBFA] p-4 text-sm font-medium leading-6 text-[#64748B]">
              Bu bölgeye ait yayınlanmış saha faaliyeti eklendiğinde burada görünecek.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
