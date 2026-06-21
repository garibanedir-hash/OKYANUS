import type { Metadata } from "next";
import { ClipboardCheck, FileText } from "lucide-react";
import { activities } from "@/data/activities";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Faaliyetlerimiz",
  description: "Okyanus Derneği'nin saha çalışmaları, faaliyet alanları ve doğrulanan faaliyet kayıtları.",
  alternates: {
    canonical: "/faaliyetler"
  }
};

export default function ActivitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Faaliyetlerimiz"
        title="Saha çalışmaları doğrulanan kayıtlarla paylaşılır"
        description="Faaliyetlerimiz; tamamlanan veya yürütülen saha çalışmalarının kayıt, gözlem ve bilgilendirme tarafını anlatır. Devam eden destek çağrıları Projeler, Yetim ve Kurban sayfalarında ayrıca sunulur."
      />
      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionHeading
              eyebrow="Bilgi Mimarisi"
              title="Faaliyetler, projelerden ayrı takip edilir"
              description="Bu sayfa saha çalışmalarının konusu ve raporlama mantığını açıklar. Projeler sayfası ise destek çağrıları ve devam eden proje başlıkları için kullanılır."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: ClipboardCheck,
                  title: "Doğrulanan Faaliyet Kaydı",
                  text: "Faaliyet bilgileri; tarih, bölge, çalışma konusu ve public özet hazır olduğunda paylaşılır."
                },
                {
                  icon: FileText,
                  title: "Rapor ve Duyuru Niteliği",
                  text: "Saha çalışmaları haber, faaliyet özeti veya rapor bağlantısı şeklinde ayrıca duyurulabilir."
                }
              ].map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                  <Icon aria-hidden className="h-6 w-6 text-ocean-green" />
                  <h2 className="mt-4 font-extrabold text-dark-navy">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-brand border border-border-soft bg-white p-6 shadow-card">
            <h2 className="text-xl font-extrabold text-dark-navy">Yayınlanmış faaliyet kayıtları</h2>
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              Doğrulanmış saha kayıtları ve faaliyet raporları yayına hazırlandığında burada listelenecektir.
            </p>
          </div>

          <SectionHeading
            eyebrow="Faaliyet Alanları"
            title="Çalışma konularımız"
            description="Aşağıdaki başlıklar destek çalışmalarının hangi ihtiyaç alanlarında planlandığını anlatır; kesin saha verisi veya istatistik içermez."
            className="mt-14"
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
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/projeler" variant="secondary" showIcon>
              Projeleri İncele
            </Button>
            <Button href="/gonullu-ol" variant="ghost" showIcon>
              Gönüllü Ol
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
