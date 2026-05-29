"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/data/projects";
import type { ProjectRegion } from "@/data/projectRegions";
import { mergeProjectsWithRegionalFallbacks } from "@/data/projectRegions";
import { Button } from "@/components/ui/Button";
import { ProjectRegionCard } from "@/components/projects/ProjectRegionCard";
import { ProjectRegionMap } from "@/components/projects/ProjectRegionMap";
import { ProjectRegionProjects } from "@/components/projects/ProjectRegionProjects";

function ActiveRegionPanel({
  region,
  projectCount,
  compact
}: {
  region: ProjectRegion;
  projectCount: number;
  compact?: boolean;
}) {
  return (
    <aside className="rounded-lg border border-[#D7E0E7] bg-white p-5 shadow-card">
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#1F8083]">Aktif Bölge</p>
      <div className="mt-3 flex items-start justify-between gap-4 border-b border-[#D7E0E7] pb-4">
        <div>
          <h3 className="text-3xl font-extrabold leading-tight text-[#0F2547]">{region.name}</h3>
          <p className="mt-1 text-sm font-bold text-[#64748B]">{region.country} · {region.regionLabel}</p>
        </div>
        <span className="rounded-md bg-[#0F2547] px-3 py-1.5 text-xs font-extrabold text-white">
          {projectCount} proje
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#526574]">{region.shortDescription}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-[#F8FAFB] p-3">
          <dt className="text-[0.66rem] font-extrabold uppercase tracking-[0.14em] text-[#64748B]">Tahmini Etki</dt>
          <dd className="mt-1 text-sm font-extrabold text-[#0F2547]">{region.beneficiaryEstimate}</dd>
        </div>
        <div className="rounded-lg bg-[#F8FAFB] p-3">
          <dt className="text-[0.66rem] font-extrabold uppercase tracking-[0.14em] text-[#64748B]">Odak</dt>
          <dd className="mt-1 text-sm font-extrabold text-[#0F2547]">{region.priorityLabel}</dd>
        </div>
      </dl>
      <div className="mt-3 rounded-lg border border-[#D7E0E7] bg-white p-3">
        <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.14em] text-[#64748B]">Çalışma Modeli</p>
        <p className="mt-1 text-sm font-bold leading-5 text-[#0F2547]">{region.operatingModel}</p>
      </div>
      <div className="mt-5 grid gap-2">
        {region.focusAreas.map((area) => (
          <div key={area} className="flex items-center gap-3 text-sm font-bold text-[#0F2547]">
            <span className="h-px w-7 bg-[#1F8083]" />
            {area}
          </div>
        ))}
      </div>
      {compact ? (
        <Button href="/projeler" variant="secondary" className="mt-6 w-full rounded-md" showIcon>
          Tüm Projeleri Gör
        </Button>
      ) : null}
    </aside>
  );
}

export function ProjectRegionSection({
  regions,
  projects,
  compact = false
}: {
  regions: ProjectRegion[];
  projects: Project[];
  compact?: boolean;
}) {
  const enrichedProjects = useMemo(() => mergeProjectsWithRegionalFallbacks(projects), [projects]);
  const [activeRegionSlug, setActiveRegionSlug] = useState<ProjectRegion["slug"]>(regions[0]?.slug ?? "gazze");
  const activeRegion = regions.find((region) => region.slug === activeRegionSlug) ?? regions[0];

  const projectCountByRegion = useMemo(() => {
    return regions.reduce<Record<string, number>>((acc, region) => {
      acc[region.slug] = enrichedProjects.filter((project) => project.regionSlug === region.slug || region.relatedProjectSlugs.includes(project.slug)).length;
      return acc;
    }, {});
  }, [enrichedProjects, regions]);

  if (!activeRegion) return null;

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-[#D7E0E7] bg-[#F8FAFB] p-3 shadow-soft sm:p-4">
        <div className={compact ? "grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]" : "grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_24rem]"}>
          <ProjectRegionMap
            regions={regions}
            activeRegionSlug={activeRegion.slug}
            onSelect={setActiveRegionSlug}
            compact={compact}
          />
          <ActiveRegionPanel
            region={activeRegion}
            projectCount={projectCountByRegion[activeRegion.slug] ?? activeRegion.activeProjectCount}
            compact={compact}
          />
        </div>
      </div>

      <div className={compact ? "grid gap-3 md:grid-cols-2 xl:grid-cols-4" : "grid gap-3 md:grid-cols-2 xl:grid-cols-4"}>
        {regions.map((region) => (
          <ProjectRegionCard
            key={region.slug}
            region={region}
            active={region.slug === activeRegion.slug}
            projectCount={projectCountByRegion[region.slug]}
            onSelect={() => setActiveRegionSlug(region.slug)}
          />
        ))}
      </div>

      <ProjectRegionProjects region={activeRegion} projects={enrichedProjects} compact={compact} />
    </div>
  );
}
