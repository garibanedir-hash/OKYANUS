import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectFilterGrid } from "@/components/ProjectFilterGrid";
import { PageHero } from "@/components/sections/PageHero";
import { ProjectRegionSection } from "@/components/projects/ProjectRegionSection";
import { mergeProjectsWithRegionalFallbacks, projectRegions } from "@/data/projectRegions";
import { getProjects } from "@/lib/data/projectsRepository";

export const metadata: Metadata = {
  title: "Projeler",
  description: "Okyanus Derneği'nin proje bazlı bağış ve destek kampanyaları."
};

export default async function ProjectsPage() {
  const projects = mergeProjectsWithRegionalFallbacks(await getProjects());

  return (
    <>
      <PageHero
        eyebrow="Projeler"
        title="Desteğinizin hangi ihtiyaca yöneldiğini görün"
        description="Proje kartları, hedef ve ulaşılan destek bilgisini şeffaf bir yapı içinde gösterecek şekilde hazırlandı."
      />
      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Çalışma Bölgelerimiz"
            title="Yakın coğrafyada ihtiyaç odaklı çalışma hatları"
            description="Okyanus İnsani Yardım Derneği olarak ihtiyaç odaklı çalışmalarımızı belirli bölgelerde sürdürülebilir, şeffaf ve insan onurunu merkeze alan bir yaklaşımla yürütüyoruz."
          />
          <div className="mt-10">
            <ProjectRegionSection regions={projectRegions} projects={projects} />
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Proje Takibi"
            title="Bölge ve kategoriye göre inceleyin"
            description="Gazze, Lübnan, Mısır ve Türkiye filtreleriyle ya da acil yardım, eğitim, su, yetim ve kurban başlıklarıyla projeleri tarayın."
          />
          <ProjectFilterGrid projects={projects} />
        </Container>
      </section>
    </>
  );
}
