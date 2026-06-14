import type { Metadata } from "next";
import { activities } from "@/data/activities";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";
import { DonationCtaButton } from "@/components/donations/DonationCtaButton";

export const metadata: Metadata = {
  title: "Faaliyet Alanları",
  description: "Okyanus Derneği'nin acil yardım, gıda, eğitim, sağlık, yetim ve kış yardımı faaliyetleri."
};

export default function ActivitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Faaliyet Alanları"
        title="Her destek, gerçek bir ihtiyaca göre planlanır"
        description="Faaliyet alanlarımız bağışların doğru planlanması, gönüllü emeğinin verimli kullanılması ve insan onurunu gözeten desteklerin ulaştırılması için ayrı ayrı takip edilir."
      />
      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Destek Kategorileri"
            title="Kime dokunuyor, nasıl destek olabilirsiniz?"
            description="Her alanın amacı, destek türleri ve bağış çağrısı net biçimde sunulur."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {activities.map(({ icon: Icon, title, description, supportTypes, slug }) => (
              <article id={slug} key={title} className="scroll-mt-32 rounded-brand border border-slate-200 bg-white p-7 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
                    <Icon aria-hidden className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-dark-navy">{title}</h2>
                    <p className="mt-3 leading-7 text-slate-600">{description}</p>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl bg-soft-gray p-4">
                  <p className="text-sm font-bold text-dark-navy">Destek türleri</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {supportTypes.map((item) => (
                      <span key={item} className="rounded-full bg-mint-green px-3 py-1 text-xs font-semibold text-ocean-green">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <DonationCtaButton label="Bu Alana Destek Ver" context={{ source: "general", campaignTitle: title }} onlineHref="/bagis-yap" showIcon />
                  <Button href="/gonullu-ol" variant="ghost" showIcon>
                    Gönüllü Destek Ol
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
