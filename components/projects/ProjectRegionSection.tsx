"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/data/projects";
import type { ProjectRegion } from "@/data/projectRegions";
import { mergeProjectsWithRegionalFallbacks } from "@/data/projectRegions";
import { ProjectRegionDetailPanel } from "@/components/projects/ProjectRegionDetailPanel";
import { ProjectRegionList } from "@/components/projects/ProjectRegionList";
import { ProjectRegionMap } from "@/components/projects/ProjectRegionMap";
import { ProjectRegionProjects } from "@/components/projects/ProjectRegionProjects";
import { cn } from "@/lib/utils";

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
      <div className="overflow-hidden rounded-xl border border-[#102B3D] bg-[#04121A] p-3 shadow-[0_34px_90px_rgba(4,18,26,0.34)] sm:p-4">
        <div className="flex flex-col gap-3 border-b border-white/10 px-1 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-[#75C9C9]">OKYANUS Projeler Haritası</p>
            <h3 className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              Operasyon bölgeleri ve proje hatları
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right sm:min-w-[20rem]">
            <div className="rounded-md border border-white/10 bg-white/[0.045] px-3 py-2">
              <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#9DB7C5]">Bölge</p>
              <p className="mt-1 text-lg font-extrabold text-white">{regions.length}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.045] px-3 py-2">
              <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#9DB7C5]">Aktif</p>
              <p className="mt-1 text-lg font-extrabold text-white">{activeRegion.name}</p>
            </div>
            <div className="rounded-md border border-[#E8B04B]/25 bg-[#E8B04B]/10 px-3 py-2">
              <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#F1C56F]">Model</p>
              <p className="mt-1 text-sm font-extrabold text-white">Public</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-4 grid gap-4",
            compact
              ? "xl:grid-cols-[minmax(0,1fr)_22rem]"
              : "xl:grid-cols-[17rem_minmax(0,1fr)_23rem]"
          )}
        >
          {compact ? null : (
            <ProjectRegionList
              regions={regions}
              activeRegionSlug={activeRegion.slug}
              projectCountByRegion={projectCountByRegion}
              onSelect={setActiveRegionSlug}
            />
          )}

          <ProjectRegionMap
            regions={regions}
            activeRegionSlug={activeRegion.slug}
            onSelect={setActiveRegionSlug}
            compact={compact}
          />

          <ProjectRegionDetailPanel
            region={activeRegion}
            projects={enrichedProjects}
            compact={compact}
          />
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

      <ProjectRegionProjects region={activeRegion} projects={enrichedProjects} compact={compact} />
    </div>
  );
}
