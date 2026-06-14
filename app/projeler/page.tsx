import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectFilterGrid } from "@/components/ProjectFilterGrid";
import { PageHero } from "@/components/sections/PageHero";
import { ProjectRegionSection } from "@/components/projects/ProjectRegionSection";
import { getPublicProjectActivitiesForProjectIds } from "@/lib/data/projectActivityRepository";
import { getPublicProjectRegions } from "@/lib/data/projectRegionRepository";
import { getProjectsWithSource } from "@/lib/data/projectsRepository";
import { getDonationPublicConfig } from "@/lib/donations/donationMode";

export const metadata: Metadata = {
  title: "Projeler",
  description: "Okyanus Derneği'nin proje bazlı bağış ve destek kampanyaları."
};

export default async function ProjectsPage() {
  const donationConfig = getDonationPublicConfig();
  const [projectsResult, regions] = await Promise.all([
    getProjectsWithSource(),
    getPublicProjectRegions()
  ]);
  const projects = projectsResult.data;
  const activities = await getPublicProjectActivitiesForProjectIds(projects.map((project) => project.id));

  return (
    <>
      <PageHero
        eyebrow="Projeler"
        title="Desteğinizin hangi ihtiyaca yöneldiğini görün"
        description="Yayındaki projeler doğrulanan içerikler, çalışma alanı ve destek yönlendirmeleriyle paylaşılır."
      />
      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Çalışma Bölgelerimiz"
            title="Doğrulanan çalışma bölgeleri"
            description="Bölge bilgileri, saha kayıtları doğrulandığında harita ve detaylarıyla birlikte paylaşılır."
          />
          {regions.length ? (
            <div className="mt-10">
              <ProjectRegionSection regions={regions} projects={projects} activities={activities} donationConfig={donationConfig} />
            </div>
          ) : (
            <div className="mt-10 rounded-brand border border-border-soft bg-white p-6 text-sm font-semibold leading-6 text-ink-muted shadow-card">
              Bölge bilgileri doğrulanan kayıtlar hazırlandığında burada paylaşılacaktır.
            </div>
          )}
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Proje Takibi"
            title="Bölge ve kategoriye göre inceleyin"
            description="Yayındaki projeler kategori, çalışma alanı ve doğrulanan içerik bilgileriyle listelenir."
          />
          <ProjectFilterGrid projects={projects} donationConfig={donationConfig} />
        </Container>
      </section>
    </>
  );
}
