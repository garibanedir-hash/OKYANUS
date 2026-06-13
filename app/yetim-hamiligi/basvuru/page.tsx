import type { Metadata } from "next";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { getActiveSponsorshipPrograms } from "@/lib/data/orphanSponsorshipRepository";
import { formatCurrency } from "@/lib/format";
import { SponsorshipApplicationForm } from "./SponsorshipApplicationForm";
import { DonationModePanel } from "@/components/donations/DonationModePanel";
import { getDonationMode } from "@/lib/donations/donationMode";
import { getTurnstilePublicConfig } from "@/lib/security/turnstilePublic";

export const metadata: Metadata = {
  title: "Yetim Hamiliği Başvurusu",
  description: "Yetim hamiliği için güvenli başvuru ve bilgilendirme akışı."
};

type OrphanSponsorshipApplicationPageProps = {
  searchParams?: Promise<{ durum?: string; program?: string; basvuru?: string; tutar?: string; mesaj?: string; panel?: string }>;
};

export default async function OrphanSponsorshipApplicationPage({ searchParams }: OrphanSponsorshipApplicationPageProps) {
  const params = await searchParams;
  const programs = await getActiveSponsorshipPrograms();
  const selectedProgram = programs.find((program) => program.slug === params?.program) ?? programs[0];
  const success = params?.durum === "basarili" || params?.durum === "alindi";
  const errorMessage = params?.durum === "hata" ? params?.mesaj : undefined;
  const amount = Number(params?.tutar);
  const donationMode = getDonationMode();
  const isOnlineMode = donationMode === "online";

  return (
    <>
      <PageHero
        eyebrow="Yetim Hamiliği Başvurusu"
        title="Düzenli destek niyetinizi güvenli şekilde iletin"
        description="Başvurunuz kayıt altına alınır; dernek yetkilileri değerlendirme, güvenli eşleştirme ve bilgilendirme sürecini yönetir."
      />

      <section className="bg-soft-gray py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-start">
            {success ? (
              <div className="rounded-brand border border-ocean-green/20 bg-white p-6 shadow-card">
                <div className="rounded-lg bg-mint-green/50 p-4">
                  <CheckCircle2 aria-hidden className="h-7 w-7 text-ocean-green" />
                  <h2 className="mt-4 text-2xl font-extrabold text-dark-navy">Yetim hamiliği başvurunuz alınmıştır.</h2>
                  <p className="mt-3 text-sm font-semibold leading-7 text-ink-muted">
                    Başvurunuz dernek yetkilileri tarafından değerlendirildikten sonra güvenli eşleştirme süreci başlatılacaktır.
                  </p>
                </div>
                <div className="mt-5 grid gap-3 rounded-lg border border-border-soft bg-soft-gray p-4 text-sm font-semibold leading-6 text-ink-muted">
                  {params?.basvuru ? (
                    <p>
                      Başvuru No: <span className="text-dark-navy">{params.basvuru}</span>
                    </p>
                  ) : null}
                  {Number.isFinite(amount) && amount > 0 ? (
                    <p>
                      Program tutarı: <span className="text-dark-navy">{formatCurrency(amount)}</span>
                    </p>
                  ) : null}
                  <p>KVKK onayınız ve iletişim tercihiniz başvuru kaydına işlenmiştir.</p>
                  <p>Destek süreci: Dernek ekibi başvurunuzu değerlendirerek sizi uygun bilgilendirme kanalına yönlendirir.</p>
                  <p>Başvuru admin tarafında değerlendirme ve eşleştirme süreci için kayıt altına alınmıştır.</p>
                  {params?.panel === "1" ? (
                    <p>Girişli sponsor hesabınızla panelde başvuru ve sponsorluk durumunu takip edebilirsiniz.</p>
                  ) : (
                    <p>Misafir başvurular panelde otomatik görünmeyebilir; dernek ekibi başvuru bilgileriniz üzerinden iletişim kurar.</p>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href="/yetim-hamiligi" variant="secondary">
                    Programa Dön
                  </Button>
                  <Button href="/panel/yetim-sponsorluk" variant="ghost">
                    Panel Önizleme
                  </Button>
                </div>
              </div>
            ) : isOnlineMode ? (
              <div className="grid gap-4">
                {errorMessage ? (
                  <div className="rounded-lg border border-warm-accent/25 bg-warm-accent/10 p-4 text-sm font-bold leading-6 text-dark-navy">
                    {errorMessage}
                  </div>
                ) : null}
                <SponsorshipApplicationForm programs={programs} selectedSlug={selectedProgram?.slug} turnstile={getTurnstilePublicConfig("orphan")} />
              </div>
            ) : (
              <DonationModePanel
                context={{ source: "orphan", campaignTitle: selectedProgram?.title }}
                onlineHref="/yetim-hamiligi/basvuru"
                title="Yetim Hamiliği Bilgilendirme Hattı"
                description="Şu anda yetim hamiliği başvuru ve destek sürecimizi WhatsApp üzerinden yönlendiriyoruz. Destek modeli ve programlar hakkında ekibimizden bilgi alabilirsiniz."
              />
            )}

            <aside className="grid gap-5">
              <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <div className="flex items-start gap-3">
                  <AlertCircle aria-hidden className="mt-1 h-5 w-5 text-ocean-green" />
                  <div>
                    <h2 className="text-xl font-extrabold text-dark-navy">Yetim hamiliği bilgilendirme hattı</h2>
                    <p className="mt-2 text-sm leading-7 text-ink-muted">
                      Tanıtım döneminde yetim hamiliği başvuruları dernek ekibi tarafından WhatsApp veya iletişim kanalları üzerinden yönlendirilir.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
                <ShieldCheck aria-hidden className="h-5 w-5 text-ocean-green" />
                <h3 className="mt-3 font-extrabold text-dark-navy">Mahremiyet notu</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  Sponsor başvurusu çocuklara ait açık kimlik, adres, okul adı, telefon veya aile detayı göstermez.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
