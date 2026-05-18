import { activities } from "@/data/activities";
import { projects } from "@/data/projects";
import { news } from "@/data/news";
import { HandHeart, ListChecks, ShieldCheck, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ActivityCard } from "@/components/ActivityCard";
import { ProjectCard } from "@/components/ProjectCard";
import { NewsCard } from "@/components/NewsCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { DonationCTA } from "@/components/sections/DonationCTA";
import { VolunteerCTA } from "@/components/sections/VolunteerCTA";
import { TrustSection } from "@/components/sections/TrustSection";
import { MotionReveal } from "@/components/MotionReveal";

const homeFlow: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: HandHeart, title: "Kimiz?", text: "Emanet bilinciyle çalışan insani yardım derneğiyiz." },
  { icon: ListChecks, title: "Ne yapıyoruz?", text: "Gıda, eğitim, sağlık, yetim ve acil yardım alanlarında destek ulaştırıyoruz." },
  { icon: ShieldCheck, title: "Neden güvenilir?", text: "Bağışları kayıt, proje takibi ve bilgilendirme süreçleriyle ele alıyoruz." },
  { icon: UsersRound, title: "Nasıl katılırsınız?", text: "Bağış yaparak veya gönüllü olarak iyilik yolculuğuna dahil olabilirsiniz." }
];

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />

      {/* Nasıl Çalışıyoruz */}
      <section className="bg-white py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Nasıl Çalışıyoruz?"
            title="Derneği tanıyın, faaliyeti görün, güvenle destek olun"
            description="Ana akışımız ziyaretçinin merak ettiği temel sorulara net cevap verir: kimiz, ne yapıyoruz, neden güveniliriz ve nasıl destek olabilirsiniz?"
            align="center"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {homeFlow.map(({ icon: Icon, title, text }, i) => (
              <MotionReveal key={title} delay={i * 0.06}>
                <article className="group relative rounded-brand border border-slate-200 bg-soft-gray p-6 transition hover:-translate-y-1 hover:shadow-card">
                  <span className="absolute right-5 top-4 select-none text-4xl font-extrabold text-slate-100">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-deep-blue shadow-sm ring-1 ring-border-soft">
                    <Icon aria-hidden className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-dark-navy">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              </MotionReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Faaliyet Alanları */}
      <section className="bg-soft-gray py-20">
        <Container>
          <SectionHeading
            eyebrow="Faaliyet Alanları"
            title="İhtiyaca göre planlanan, insana yakışır destekler"
            description="Her faaliyet alanını sahadan gelen gerçek ihtiyaçlara göre tasarlıyor; bağışçı ve gönüllülerimizin desteğini doğru yere ulaştırmak için çalışıyoruz."
            align="center"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity, index) => (
              <MotionReveal key={activity.title} delay={index * 0.04}>
                <ActivityCard {...activity} />
              </MotionReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Öne Çıkan Projeler */}
      <section className="bg-white py-20">
        <Container>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Öne Çıkan Projeler"
              title="Desteğinizi proje bazlı görün"
              description="Her proje, hedef ve ulaşılan destek bilgisini gösterecek şekilde hazırlandı."
            />
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {projects.map((project, index) => (
              <MotionReveal key={project.title} delay={index * 0.04}>
                <ProjectCard {...project} />
              </MotionReveal>
            ))}
          </div>
        </Container>
      </section>

      <TrustSection />
      <VolunteerCTA />
      <DonationCTA />

      {/* Haberler */}
      <section className="bg-white py-20">
        <Container>
          <SectionHeading
            eyebrow="Haberler / Duyurular"
            title="Sahadan ve dernek çalışmalarından notlar"
            description="Yapılan faaliyetlerin, gönüllü buluşmalarının ve kampanya duyurularının düzenli takip edilebildiği alan."
            align="center"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {news.map((item, index) => (
              <MotionReveal key={item.slug} delay={index * 0.05}>
                <NewsCard {...item} />
              </MotionReveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
