import { activities } from "@/data/activities";
import { HandHeart, ListChecks, ShieldCheck, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getFeaturedProjects } from "@/lib/data/projectsRepository";
import { getLatestNews } from "@/lib/data/newsRepository";
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

export default async function HomePage() {
  const [projects, news] = await Promise.all([
    getFeaturedProjects(4),
    getLatestNews(3)
  ]);

  return (
    <>
      <HeroSection />
      <StatsSection />

      {/* ── Nasıl Çalışıyoruz? ── */}
      <section className="bg-white py-20 sm:py-28">
        <Container>
          <MotionReveal>
            <SectionHeading
              eyebrow="Nasıl Çalışıyoruz?"
              title="Derneği tanıyın, faaliyeti görün, güvenle destek olun"
              description="Temel sorularınıza net yanıtlar: Kimiz, ne yapıyoruz, neden güveniliriz ve nasıl destek olabilirsiniz?"
              align="center"
            />
          </MotionReveal>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {homeFlow.map(({ icon: Icon, title, text }, i) => (
              <MotionReveal key={title} delay={i * 0.07}>
                <article className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1.5 hover:shadow-card">
                  {/* Top accent */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-ocean-green/60 to-transparent" />
                  {/* Step watermark */}
                  <span className="absolute right-4 top-3 select-none font-extrabold leading-none text-slate-100" style={{ fontSize: "3.5rem" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue ring-1 ring-border-soft">
                    <Icon aria-hidden className="h-6 w-6" />
                  </span>
                  <h3 className="relative mt-5 text-xl font-bold text-dark-navy">{title}</h3>
                  <p className="relative mt-3 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              </MotionReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Faaliyet Alanları ── */}
      <section className="bg-soft-gray py-20 sm:py-24">
        <Container>
          <MotionReveal>
            <SectionHeading
              eyebrow="Faaliyet Alanları"
              title="İhtiyaca göre planlanan, insana yakışır destekler"
              description="Her alanı sahadan gelen gerçek ihtiyaçlara göre tasarlıyor; desteğinizi doğru yere ulaştırıyoruz."
              align="center"
            />
          </MotionReveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity, index) => (
              <MotionReveal key={activity.title} delay={index * 0.05}>
                <ActivityCard {...activity} />
              </MotionReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Öne Çıkan Projeler ── */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <MotionReveal>
            <SectionHeading
              eyebrow="Öne Çıkan Projeler"
              title="Desteğinizi proje bazlı görün"
              description="Her proje, hedef ve ulaşılan destek bilgisini gösterecek şekilde hazırlandı."
            />
          </MotionReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {projects.length ? (
              projects.map((project, index) => (
                <MotionReveal key={project.slug} delay={index * 0.05}>
                  <ProjectCard {...project} />
                </MotionReveal>
              ))
            ) : (
              <div className="rounded-brand border border-border-soft bg-white p-6 text-sm font-semibold leading-6 text-ink-muted md:col-span-2 xl:col-span-4">
                Yayında olan öne çıkan proje bulunmuyor.
              </div>
            )}
          </div>
        </Container>
      </section>

      <TrustSection />
      <VolunteerCTA />
      <DonationCTA />

      {/* ── Haberler ── */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <MotionReveal>
            <SectionHeading
              eyebrow="Haberler & Duyurular"
              title="Sahadan ve dernek çalışmalarından notlar"
              description="Faaliyetlerin, gönüllü buluşmalarının ve kampanya duyurularının düzenli takip edilebildiği alan."
              align="center"
            />
          </MotionReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {news.length ? (
              news.map((item, index) => (
                <MotionReveal key={item.slug} delay={index * 0.06}>
                  <NewsCard {...item} />
                </MotionReveal>
              ))
            ) : (
              <div className="rounded-brand border border-border-soft bg-white p-6 text-sm font-semibold leading-6 text-ink-muted md:col-span-3">
                Yayında olan haber bulunmuyor.
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
