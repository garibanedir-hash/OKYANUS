import type { Metadata } from "next";
import { CheckCircle2, ClipboardCheck, HandHeart, MapPin, ReceiptText, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getActiveQurbanCampaignsWithSource } from "@/lib/data/qurbanRepository";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Kurban Çalışmaları",
  description: "Okyanus İnsani Yardım Derneği kurban bağışı, vekalet, kesim ve dağıtım takip akışı."
};

const qurbanTypes = ["Vacip", "Adak", "Akika", "Şükür", "Nafile"];

const processSteps = [
  "Kurban türü seçilir",
  "Vekalet onayı alınır",
  "Bağış kaydı oluşturulur",
  "Kesim planlanır",
  "Dağıtım yapılır",
  "Bağışçı bilgilendirilir"
];

export default async function QurbanPage() {
  const { data: campaigns, source } = await getActiveQurbanCampaignsWithSource();

  return (
    <>
      <PageHero
        eyebrow="Kurban Çalışmaları"
        title="Kurban Bağışlarınız Emanet Bilinciyle Takip Edilir"
        description="Okyanus İnsani Yardım Derneği olarak kurban bağışlarınızı vekalet, kesim ve dağıtım süreçleriyle kayıt altına alınabilir bir yapıda takip ediyoruz."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/kurban/bagis" showIcon>
            Kurban Bağışı Yap
          </Button>
          <Button href="#surec" variant="ghost" showIcon>
            Kurban Sürecini İncele
          </Button>
        </div>
      </PageHero>

      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading
              eyebrow="Aktif Kampanyalar"
              title="Kurban kampanyalarını inceleyin"
              description="Bu aşamada ödeme ve gerçek kayıt oluşturma kapalıdır; sayfalar kurban operasyon akışını demo/read-only olarak gösterir."
            />
            <span className="rounded-full bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
              Veri kaynağı: {source === "supabase" ? "Supabase read-only" : "Demo fallback"}
            </span>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {campaigns.map((campaign) => {
              const reservedRatio = campaign.quotaTotal > 0 ? Math.min(100, Math.round((campaign.quotaReserved / campaign.quotaTotal) * 100)) : 0;
              return (
                <article key={campaign.id} className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-ocean-green">
                    <span>{campaign.typeLabel}</span>
                    <span className="h-1 w-1 rounded-full bg-ocean-green" />
                    <span>{campaign.regionLabel}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-extrabold leading-snug text-dark-navy">{campaign.title}</h2>
                  <p className="mt-3 min-h-20 text-sm leading-6 text-ink-muted">{campaign.shortDescription}</p>
                  <div className="mt-5 grid gap-3 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-ink-muted">
                      <MapPin aria-hidden className="h-4 w-4 text-ocean-green" />
                      {campaign.country} · {campaign.cityOrRegion}
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-soft-gray p-3">
                      <span className="text-xs font-extrabold uppercase text-ink-muted">Birim bedel</span>
                      <strong className="text-dark-navy">{formatCurrency(campaign.unitPrice)}</strong>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold text-ink-muted">
                        <span>Rezerve hisse/adet</span>
                        <span>{campaign.quotaReserved}/{campaign.quotaTotal}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-soft-gray">
                        <div className="h-full rounded-full bg-ocean-green" style={{ width: `${reservedRatio}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button href={`/kurban/${campaign.slug}`} variant="secondary" showIcon>
                      İncele
                    </Button>
                    <Button href={`/kurban/bagis?kampanya=${campaign.slug}`} variant="ghost">
                      Bağış Akışı
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          {!campaigns.length ? (
            <div className="mt-8 rounded-brand border border-border-soft bg-white p-8 text-center shadow-card">
              <h2 className="text-xl font-extrabold text-dark-navy">Aktif kurban kampanyası yok</h2>
              <p className="mt-2 text-ink-muted">Yeni kampanyalar yayına alındığında bu alanda listelenecektir.</p>
            </div>
          ) : null}
        </Container>
      </section>

      <section id="surec" className="bg-soft-gray py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Vekalet ve Takip"
                title="Kurban süreci aşama aşama izlenir"
                description="Her aşama ayrı bir durum olarak kurgulanır. Gerçek ödeme, makbuz ve bildirim entegrasyonları sonraki fazlarda açılacaktır."
              />
              <div className="mt-7 grid grid-cols-2 gap-3">
                {qurbanTypes.map((type) => (
                  <div key={type} className="rounded-lg border border-border-soft bg-white p-4 text-sm font-extrabold text-dark-navy shadow-sm">
                    {type}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {processSteps.map((step, index) => (
                <div key={step} className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-green text-sm font-black text-ocean-green">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-extrabold text-dark-navy">{step}</h3>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-dark-navy py-14 text-white">
        <Container>
          <div className="grid gap-5 md:grid-cols-4">
            {[
              { icon: HandHeart, title: "Emanet Bilinci", text: "Vekalet ve bağış akışı ayrı takip edilir." },
              { icon: ClipboardCheck, title: "Operasyon Takibi", text: "Kesim planı ve dağıtım durumu izlenir." },
              { icon: ReceiptText, title: "Rapor Hazırlığı", text: "Export ve raporlama için veri modeli hazırdır." },
              { icon: ShieldCheck, title: "Güvenli Kapsam", text: "Bu fazda gerçek kayıt veya ödeme oluşturulmaz." }
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <Icon aria-hidden className="h-6 w-6 text-mint-green" />
                <h2 className="mt-4 font-extrabold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/68">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 text-mint-green" />
              <p className="text-sm leading-7 text-white/78">
                Şeffaflık notu: Bu ekranlarda görülen vekalet metinleri ve süreç açıklamaları demo/taslak niteliğindedir. Production kullanımı öncesi dernek yönetimi, hukuk danışmanı ve dini danışman onayı gerekir.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
