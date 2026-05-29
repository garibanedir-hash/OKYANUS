"use client";

import { useState } from "react";
import type { Project } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard";

const filters = ["Tüm Projeler", "Gazze", "Lübnan", "Mısır", "Türkiye", "Acil Yardım", "Eğitim", "Su", "Yetim", "Kurban"] as const;

function matchesFilter(project: Project, filter: (typeof filters)[number]) {
  if (filter === "Tüm Projeler") return true;
  if (project.regionName === filter) return true;
  if (project.category === filter) return true;

  const normalized = [project.title, project.summary, project.description, project.category, project.regionName, ...(project.tags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");

  if (filter === "Su") return normalized.includes("su") || normalized.includes("hijyen");
  if (filter === "Kurban") return normalized.includes("kurban") || normalized.includes("vekalet");
  return normalized.includes(filter.toLocaleLowerCase("tr-TR"));
}

export function ProjectFilterGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<(typeof filters)[number]>("Tüm Projeler");
  const visibleProjects =
    active === "Tüm Projeler" ? projects : projects.filter((project) => matchesFilter(project, active));

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            aria-pressed={active === filter}
            className={`focus-ring rounded-full px-4 py-2 text-sm font-semibold transition ${
              active === filter ? "bg-deep-blue text-white shadow-card" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-soft-blue"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {visibleProjects.length ? (
          visibleProjects.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))
        ) : (
          <div className="rounded-brand border border-border-soft bg-white p-6 text-sm font-semibold leading-6 text-ink-muted md:col-span-2 xl:col-span-4">
            Bu kategoride yayında olan proje bulunmuyor.
          </div>
        )}
      </div>
    </>
  );
}
