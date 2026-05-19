"use client";

import { useState } from "react";
import type { Project, ProjectCategory } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard";

const filters = ["Tüm Projeler", "Eğitim", "Gıda", "Sağlık", "Acil Yardım", "Yetim"] as const;

export function ProjectFilterGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<(typeof filters)[number]>("Tüm Projeler");
  const visibleProjects =
    active === "Tüm Projeler" ? projects : projects.filter((project) => project.category === (active as ProjectCategory));

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
