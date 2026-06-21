"use client";

import { useState } from "react";
import type { Project } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard";
import type { DonationPublicConfig } from "@/lib/donations/donationTarget";

const filters = ["Tüm Projeler", "Gıda", "Genel Destek"] as const;
const featuredWorkCategories = new Set(["Yetim", "Kurban"]);

function matchesFilter(project: Project, filter: (typeof filters)[number]) {
  if (filter === "Tüm Projeler") return true;
  if (filter === "Gıda") return project.category === "Gıda";

  if (filter === "Genel Destek") {
    return project.category !== "Gıda" && !featuredWorkCategories.has(project.category);
  }

  return false;
}

export function ProjectFilterGrid({
  projects,
  donationConfig
}: {
  projects: Project[];
  donationConfig?: DonationPublicConfig;
}) {
  const [active, setActive] = useState<(typeof filters)[number]>("Tüm Projeler");
  const listedProjects = projects.filter((project) => !featuredWorkCategories.has(project.category));
  const visibleProjects =
    active === "Tüm Projeler" ? listedProjects : listedProjects.filter((project) => matchesFilter(project, active));

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
            <ProjectCard key={project.slug} {...project} donationConfig={donationConfig} />
          ))
        ) : (
          <div className="rounded-brand border border-border-soft bg-white p-6 text-sm font-semibold leading-6 text-ink-muted md:col-span-2 xl:col-span-4">
            Bu başlıkta yayında olan proje bulunmuyor. Doğrulanan proje kayıtları hazırlandığında bu alanda paylaşılacaktır.
          </div>
        )}
      </div>
    </>
  );
}
