import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectFilterGrid } from "@/components/ProjectFilterGrid";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Projeler",
  description: "Okyanus Derneği'nin proje bazlı bağış ve destek kampanyaları."
};

export default function ProjectsPage() {
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
            eyebrow="Proje Takibi"
            title="Kategoriye göre inceleyin, uygun projeye destek olun"
            description="Filtreleme ve progress yapısı frontend olarak hazırlandı. Gerçek bağış ve raporlama entegrasyonu sonraki aşamada bağlanabilir."
          />
          <ProjectFilterGrid />
        </Container>
      </section>
    </>
  );
}
