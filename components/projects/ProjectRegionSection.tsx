"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/data/projects";
import type { PublicProjectActivity } from "@/data/projectActivityMock";
import type { ProjectRegion } from "@/data/projectRegions";
import { mergeProjectsWithRegionalFallbacks } from "@/data/projectRegions";
import { ProjectRegionDetailPanel } from "@/components/projects/ProjectRegionDetailPanel";
import { ProjectRegionList } from "@/components/projects/ProjectRegionList";
import { ProjectRegionMap } from "@/components/projects/ProjectRegionMap";
import { ProjectRegionProjects } from "@/components/projects/ProjectRegionProjects";
import { cn } from "@/lib/utils";
import type { DonationPublicConfig } from "@/lib/donations/donationTarget";

export function ProjectRegionSection({
  regions,
  projects,
  activities = [],
  compact = false,
  donationConfig
}: {
  regions: ProjectRegion[];
  projects: Project[];
  activities?: PublicProjectActivity[];
  compact?: boolean;
  donationConfig?: DonationPublicConfig;
}) {
  const enrichedProjects = useMemo(() => (projects.length ? projects : mergeProjectsWithRegionalFallbacks(projects)), [projects]);
  const initialRegionSlug =
    regions.find((region) => enrichedProjects.some((project) => project.regionSlug === region.slug || region.relatedProjectSlugs.includes(project.slug)))?.slug ??
    regions[0]?.slug ??
    "gazze";
  const [activeRegionSlug, setActiveRegionSlug] = useState<ProjectRegion["slug"]>(initialRegionSlug);
  const activeRegion = regions.find((region) => region.slug === activeRegionSlug) ?? regions[0];

  const projectCountByRegion = useMemo(() => {
    return regions.reduce<Record<string, number>>((acc, region) => {
      acc[region.slug] = enrichedProjects.filter((project) => project.regionSlug === region.slug || region.relatedProjectSlugs.includes(project.slug)).length;
      return acc;
    }, {});
  }, [enrichedProjects, regions]);

  const totalProjectCount = Object.values(projectCountByRegion).reduce((total, count) => total + count, 0);

  if (!activeRegion) return null;

  return (
    <div className="grid gap-6">
      <div className="min-w-0 rounded-xl border border-[#DDE8E7] bg-[#F7FAF9] p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-4 px-1 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[#1F8083]">Bölge Bazlı Yardım Çalışmaları</p>
            <h3 className="mt-2 text-2xl font-bold leading-tight text-[#0F2547] sm:text-3xl">
              Yardımlarımızın ulaştığı bölgeler
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#64748B]">
              Okyanus İnsani Yardım Derneği olarak çalışmalarımızı bölge, ihtiyaç ve saha bilgisini dikkate alan güvenilir bir yardım yaklaşımıyla yürütüyoruz.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right sm:min-w-[22rem]">
            <div className="rounded-lg border border-[#DDE8E7] bg-white px-3 py-3">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[#64748B]">Bölge</p>
              <p className="mt-1 text-lg font-semibold text-[#0F2547]">{regions.length}</p>
            </div>
            <div className="rounded-lg border border-[#DDE8E7] bg-white px-3 py-3">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[#64748B]">Proje</p>
              <p className="mt-1 text-lg font-semibold text-[#0F2547]">{totalProjectCount}</p>
            </div>
            <div className="rounded-lg border border-[#DDE8E7] bg-white px-3 py-3">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[#64748B]">Etki</p>
              <p className="mt-1 text-sm font-semibold text-[#0F2547]">{activeRegion.stats[0]?.value ?? activeRegion.beneficiaryEstimate}</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-4 grid min-w-0 gap-4",
            compact
              ? "xl:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]"
              : "xl:grid-cols-[280px_minmax(0,1fr)_340px] 2xl:grid-cols-[300px_minmax(0,1fr)_370px]"
          )}
        >
          {compact ? null : (
            <div className="order-3 min-w-0 xl:order-1">
              <ProjectRegionList
                regions={regions}
                activeRegionSlug={activeRegion.slug}
                projectCountByRegion={projectCountByRegion}
                onSelect={setActiveRegionSlug}
              />
            </div>
          )}

          <div className="order-1 min-w-0 xl:order-2">
            <ProjectRegionMap
              regions={regions}
              activeRegionSlug={activeRegion.slug}
              onSelect={setActiveRegionSlug}
              compact={compact}
            />
          </div>

          <div className="order-2 min-w-0 xl:order-3">
            <ProjectRegionDetailPanel
              region={activeRegion}
              projects={enrichedProjects}
              compact={compact}
              donationConfig={donationConfig}
            />
          </div>
        </div>

        {compact ? (
          <div className="mt-4">
            <ProjectRegionList
              regions={regions}
              activeRegionSlug={activeRegion.slug}
              projectCountByRegion={projectCountByRegion}
              onSelect={setActiveRegionSlug}
              compact
            />
          </div>
        ) : null}
      </div>

      <ProjectRegionProjects region={activeRegion} projects={enrichedProjects} activities={activities} compact={compact} />
    </div>
  );
}
