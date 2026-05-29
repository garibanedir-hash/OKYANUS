"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/data/projects";
import type { ProjectRegion } from "@/data/projectRegions";
import { mergeProjectsWithRegionalFallbacks } from "@/data/projectRegions";
import { Button } from "@/components/ui/Button";
import { ProjectRegionCard } from "@/components/projects/ProjectRegionCard";
import { ProjectRegionMap } from "@/components/projects/ProjectRegionMap";
import { ProjectRegionProjects } from "@/components/projects/ProjectRegionProjects";

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
      <div className={compact ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]" : "grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)]"}>
        <ProjectRegionMap
          regions={regions}
          activeRegionSlug={activeRegion.slug}
          onSelect={setActiveRegionSlug}
          compact={compact}
        />
        <div className="grid gap-3">
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
      </div>

      <ProjectRegionProjects region={activeRegion} projects={enrichedProjects} compact={compact} />

      {compact ? (
        <div className="flex justify-start">
          <Button href="/projeler" variant="secondary" showIcon>
            Tüm Projeleri Gör
          </Button>
        </div>
      ) : null}
    </div>
  );
}
