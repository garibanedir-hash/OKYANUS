import type { Metadata } from "next";
import { CheckCircle2, ClipboardCheck, HandHeart, MapPin, ReceiptText, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getActiveQurbanCampaigns } from "@/lib/data/qurbanRepository";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Kurban Çalışmaları",
  description: "Okyanus İnsani Yardım Derneği kurban bağışı, vekalet, kesim ve dağıtım takip akışı."
};

const qurbanTypes = ["Vacip", "Adak", "Akika", "Şükür", "Nafile"];

const processSteps = [
  {
    title: "Kurban türü ve kampanya seçilir",
    text: "Bağışçı uygun kampanyayı, bölgeyi ve hisse/adet bilgisini görerek başvuruya başlar."
  },
  {
    title: "Vekalet onayı kaydedilir",
    text: "Vekalet kabulü ayrı kayıt olarak tutulur ve bağış başvurusu ile ilişkilendirilir."
  },
  {
    title: "Başvuru ödeme bekliyor durumuna alınır",
    text: "Ödeme entegrasyonu açılana kadar sipariş ve hisse/adet rezervasyonu takipte kalır."
  },
  {
    title: "Kesim planlaması yapılır",
    text: "Ödeme ve operasyon onayları netleştikçe kesim listeleri kontrollü şekilde hazırlanır."
  },
  {
    title: "Dağıtım ve raporlama izlenir",
    text: "Dağıtım özetleri ve saha raporları operasyon ekibi tarafından takip edilir."
  },
  {
    title: "Bağışçı bilgilendirilir",
    text: "Bildirim ve makbuz süreçleri ödeme entegrasyonu tamamlandığında gerçek kanallara bağlanır."
  }
];

export default async function QurbanPage() {
  const campaigns = await getActiveQurbanCampaigns();

  return (
    <>
      <PageHero
        eyebrow="Kurban Çalışmaları"
        title="Kurban Bağışlarınız Emanet Bilinciyle Takip Edilir"
        description="Okyanus İnsani Yardım Derneği olarak kurban bağışlarınızı vekalet, kesim, dağıtım ve bilgilendirme süreçleriyle kayıt altına alınabilir bir yapıda takip ediyoruz."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/kurban/bagis" showIcon>
            Kurban Bağışı Yap
          </Button>
          <Button href="#surec" variant="ghost" showIcon>
            Süreci İncele
          </Button>
        </div>
      </PageHero>

      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading
              eyebrow="Aktif Kampanyalar"
              title="Kurban kampanyalarını inceleyin"
              description="Aktif kampanyalarda kurban türü, bölge, birim bedel ve kalan kontenjan bilgilerini inceleyerek başvuru oluşturabilirsiniz."
            />
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
                      Süreci İncele
                    </Button>
                    <Button href={`/kurban/bagis?kampanya=${campaign.slug}`} variant="ghost">
                      Kurban Bağışı Yap
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          {!campaigns.length ? (
            <div className="mt-8 rounded-brand border border-border-soft bg-white p-8 text-center shadow-card">
              <h2 className="text-xl font-extrabold text-dark-navy">Aktif kurban kampanyası yok</h2>
              <p className="mt-2 text-ink-muted">Yeni kurban kampanyaları yayına alındığında bu alanda listelenecektir. Dilerseniz genel bağış çalışmalarımızı inceleyebilirsiniz.</p>
              <div className="mt-5">
                <Button href="/bagis" variant="secondary">
                  Genel Bağış Sayfası
                </Button>
              </div>
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
                description="Vekalet kabulü, başvuru kaydı, kesim planı, dağıtım ve bilgilendirme süreçleri birbirinden ayrılmış durumlarla takip edilir."
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
                <div key={step.title} className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-green text-sm font-black text-ocean-green">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-extrabold text-dark-navy">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{step.text}</p>
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
              { icon: ReceiptText, title: "Rapor Hazırlığı", text: "Makbuz ve bildirim süreçleri ödeme entegrasyonu sonrası bağlanacaktır." },
              { icon: ShieldCheck, title: "Güvenli Kapsam", text: "Başvurular kayıt altına alınır; online ödeme henüz başlatılmaz." }
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
