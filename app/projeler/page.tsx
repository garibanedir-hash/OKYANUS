import type { Metadata } from "next";
import { Baby, HandHeart, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectFilterGrid } from "@/components/ProjectFilterGrid";
import { PageHero } from "@/components/sections/PageHero";
import { ProjectRegionSection } from "@/components/projects/ProjectRegionSection";
import { Button } from "@/components/ui/Button";
import { getPublicProjectActivitiesForProjectIds } from "@/lib/data/projectActivityRepository";
import { getPublicProjectRegions } from "@/lib/data/projectRegionRepository";
import { getProjectsWithSource } from "@/lib/data/projectsRepository";
import { getDonationPublicConfig } from "@/lib/donations/donationMode";

export const metadata: Metadata = {
  title: "Projeler",
  description: "Okyanus Derneği'nin proje bazlı bağış ve destek kampanyaları.",
  alternates: {
    canonical: "/projeler"
  }
};

const featuredWorks = [
  {
    title: "Yetim Hamiliği",
    href: "/yetim-hamiligi",
    icon: Baby,
    description:
      "Çocuk mahremiyetini koruyan, düzenli takip ve güvenli bilgilendirme esasına dayanan ayrı bir destek alanı.",
    note: "Yetim destek süreci proje kartından bağımsız, kendi sayfasında anlatılır."
  },
  {
    title: "Kurban Çalışmaları",
    href: "/kurban",
    icon: HandHeart,
    description:
      "Vekalet, kesim, dağıtım ve bağışçı bilgilendirmesi süreçlerini ayrı takip eden kurban organizasyonu.",
    note: "Kurban başvuruları WhatsApp yönlendirmesiyle tanıtım modunda yürütülür."
  }
];

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
            eyebrow="Öne Çıkan Çalışma Alanları"
            title="Yetim ve Kurban kendi sayfalarında anlatılır"
            description="Bu iki alan, sıradan proje kartı gibi değil; süreçleri, mahremiyet notları ve destek akışıyla ayrı çalışma başlıkları olarak sunulur."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {featuredWorks.map(({ icon: Icon, title, description, href, note }) => (
              <article key={title} className="rounded-brand border border-border-soft bg-warm-white p-7 shadow-card">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mint-green text-ocean-green">
                    <Icon aria-hidden className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-extrabold text-dark-navy">{title}</h2>
                    <p className="mt-3 leading-7 text-ink-muted">{description}</p>
                  </div>
                </div>
                <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white p-4 text-sm leading-6 text-ink-muted">
                  <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ocean-green" />
                  <span>{note}</span>
                </div>
                <Button href={href} variant="secondary" className="mt-6" showIcon>
                  Sayfayı İncele
                </Button>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-soft-gray py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Proje Takibi"
            title="Destek projelerini sade filtrelerle inceleyin"
            description="Projeler; gerçek kayıtlar yayına alındığında gıda ve genel destek başlıkları altında listelenir. Yetim ve kurban çalışmaları kendi sayfalarında ayrıca ele alınır."
          />
          <ProjectFilterGrid projects={projects} donationConfig={donationConfig} />
        </Container>
      </section>
    </>
  );
}
