import type { Metadata } from "next";
import { BookOpen, CheckCircle2, ClipboardCheck, HandHeart, HelpCircle, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getActiveSponsorshipPrograms } from "@/lib/data/orphanSponsorshipRepository";
import { DonationCtaButton } from "@/components/donations/DonationCtaButton";

export const metadata: Metadata = {
  title: "Yetim Hamiliği",
  description: "Okyanus İnsani Yardım Derneği yetim hamiliği ve sponsorluk programları."
};

const processItems = [
  "Başvuru alınır",
  "Sponsor profili güvenli şekilde hazırlanır",
  "Uygun sponsorluk eşleşmesi yapılır",
  "Düzenli destek süreci takip edilir",
  "Güvenli periyodik güncellemeler paylaşılır"
];

const faqItems = [
  {
    question: "Çocuk bilgileri neden sınırlı gösterilir?",
    answer: "Çocuk mahremiyeti ve güvenliği için açık kimlik, açık adres, okul adı, telefon ve aile detayı paylaşılmaz."
  },
  {
    question: "Bu aşamada ödeme alınıyor mu?",
    answer: "Tanıtım döneminde destek süreci WhatsApp ve iletişim kanalları üzerinden yönlendirilir; online ödeme formu gösterilmez."
  },
  {
    question: "Sponsor nasıl bilgilendirilir?",
    answer: "Başvuru sonrasında dernek ekibi uygun bilgilendirme kanalı üzerinden sponsor adayına dönüş yapar."
  }
];

export default async function OrphanSponsorshipPage() {
  const programs = await getActiveSponsorshipPrograms();

  return (
    <>
      <PageHero
        eyebrow="Yetim Hamiliği"
        title="Bir Yetimin Hayatına Güvenli ve Sürekli Destek Olun"
        description="Okyanus İnsani Yardım Derneği olarak yetim hamiliği çalışmalarını çocuk mahremiyetini koruyan, düzenli takip edilebilir ve şeffaf bir destek anlayışıyla yürütüyoruz."
      >
        <div className="flex flex-wrap gap-3">
          <DonationCtaButton label="Yetim Hamiliğine Başvur" context={{ source: "orphan" }} onlineHref="/yetim-hamiligi/basvuru" showIcon />
          <Button href="/yetim-hamiligi/surec" variant="ghost" showIcon>
            Süreci İncele
          </Button>
        </div>
      </PageHero>

      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Program Yaklaşımı"
                title="Yetim hamiliği nedir?"
                description="Yetim hamiliği, çocuğun onurunu ve güvenliğini koruyarak eğitim, temel ihtiyaç ve sosyal destek süreçlerine düzenli katkı sunma modelidir."
              />
              <div className="mt-7 grid gap-4">
                {[
                  { icon: HandHeart, title: "Sürekli Destek", text: "Tek seferlik yardım yerine takip edilebilir aylık destek modeli hedeflenir." },
                  { icon: ClipboardCheck, title: "Kayıtlı Süreç", text: "Başvuru, eşleşme, destek ve güncelleme adımları ayrı statülerle izlenir." },
                  { icon: ShieldCheck, title: "Mahremiyet", text: "Sponsor panelinde yalnızca güvenli özetler paylaşılır." }
                ].map(({ icon: Icon, title, text }) => (
                  <article key={title} className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
                    <Icon aria-hidden className="h-6 w-6 text-ocean-green" />
                    <h2 className="mt-4 font-extrabold text-dark-navy">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">{text}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
              <h2 className="text-xl font-extrabold text-dark-navy">Destek süreci nasıl işler?</h2>
              <div className="mt-5 grid gap-3">
                {processItems.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg bg-soft-gray p-4 text-sm font-bold text-dark-navy">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-green text-xs font-black text-ocean-green">{index + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-soft-gray py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Sponsorluk Programları"
            title="Aylık destek modeli"
            description="Aktif programlar güvenli ön başvuru ve bilgilendirme akışına yönlendirir."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {programs.map((program) => (
              <article key={program.id} className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-ocean-green">
                  <BookOpen aria-hidden className="h-4 w-4" />
                  <span>{program.country} · {program.region}</span>
                </div>
                <h2 className="mt-3 text-xl font-extrabold leading-snug text-dark-navy">{program.title}</h2>
                <p className="mt-3 min-h-20 text-sm leading-6 text-ink-muted">{program.shortDescription}</p>
                <div className="mt-5 rounded-lg bg-soft-gray p-4">
                  <p className="text-xs font-extrabold uppercase text-ink-muted">Destek bilgisi</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">
                    Destek modeli ve program detayları dernek ekibi tarafından doğrulanarak paylaşılır.
                  </p>
                </div>
                <p className="mt-4 text-xs font-bold leading-6 text-ink-muted">{program.transparencyNote}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <DonationCtaButton
                    label="Başvur"
                    context={{ source: "orphan", campaignTitle: program.title }}
                    onlineHref={`/yetim-hamiligi/basvuru?program=${program.slug}`}
                    variant="secondary"
                    showIcon
                  />
                  <Button href="/yetim-hamiligi/surec" variant="ghost">
                    Süreci İncele
                  </Button>
                </div>
              </article>
            ))}
          </div>
          {!programs.length ? (
            <div className="mt-8 rounded-brand border border-border-soft bg-white p-8 text-center shadow-card">
              <h2 className="text-xl font-extrabold text-dark-navy">Aktif yetim hamiliği programı yok</h2>
              <p className="mt-2 text-ink-muted">Programlar yayına alındığında bu alanda listelenecektir.</p>
            </div>
          ) : null}
        </Container>
      </section>

      <section className="bg-dark-navy py-14 text-white">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <ShieldCheck aria-hidden className="h-8 w-8 text-mint-green" />
              <h2 className="mt-4 text-2xl font-extrabold">Çocuk mahremiyeti ve güvenli bilgi paylaşımı</h2>
              <p className="mt-3 text-sm leading-7 text-white/72">
                Açık kimlik, açık adres, okul adı, telefon, aile detayı ve hassas sağlık verisi public sayfada veya sponsor panelinde gösterilmez. Fotoğraf kullanımı ayrıca açık rıza ve kurum politikası gerektirir.
              </p>
            </div>
            <div className="grid gap-3">
              {faqItems.map((item) => (
                <article key={item.question} className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle aria-hidden className="mt-1 h-5 w-5 text-mint-green" />
                    <div>
                      <h3 className="font-extrabold">{item.question}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/70">{item.answer}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-5">
            <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 text-mint-green" />
            <p className="text-sm leading-7 text-white/76">
              Program metinleri çocuk mahremiyeti, veri minimizasyonu ve kurum içi değerlendirme ilkeleri gözetilerek hazırlanır; detaylı süreçler dernek ekibi tarafından başvuru sahibine aktarılır.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
