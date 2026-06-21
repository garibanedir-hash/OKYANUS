import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ClipboardCheck, HandHeart, MapPin, ReceiptText, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getLegalPagePath } from "@/data/legalPages";
import { getActiveQurbanCampaigns } from "@/lib/data/qurbanRepository";
import { DonationCtaButton } from "@/components/donations/DonationCtaButton";

export const metadata: Metadata = {
  title: "Kurban Çalışmaları",
  description: "Okyanus İnsani Yardım Derneği kurban bağışı, vekalet, kesim ve dağıtım takip akışı.",
  alternates: {
    canonical: "/kurban"
  }
};

const qurbanTypes = ["Vacip", "Adak", "Akika", "Şükür", "Nafile"];

const processSteps = [
  {
    title: "Kurban türü ve kampanya seçilir",
    text: "Bağışçı uygun kampanya, bölge ve destek niyetini ileterek başvuruya başlar."
  },
  {
    title: "Vekalet onayı kaydedilir",
    text: "Vekalet kabulü ayrı kayıt olarak tutulur ve bağış başvurusu ile ilişkilendirilir."
  },
  {
    title: "Başvuru ekip takibine alınır",
    text: "Tanıtım döneminde başvuru ve hisse/adet bilgileri ekip yönlendirmesiyle takip edilir."
  },
  {
    title: "Kesim planlaması yapılır",
    text: "Emanet bilgileri ve operasyon onayları netleştikçe kesim listeleri kontrollü şekilde hazırlanır."
  },
  {
    title: "Dağıtım ve raporlama izlenir",
    text: "Dağıtım özetleri ve saha raporları operasyon ekibi tarafından takip edilir."
  },
  {
    title: "Bağışçı bilgilendirilir",
    text: "Bağışçıya süreç, vekalet ve dağıtım aşamaları hakkında güvenli iletişim kanallarıyla bilgi verilir."
  }
];

const qurbanHighlights = [
  {
    title: "Kurban Organizasyonu",
    text: "Kurban çalışmaları; bağış niyeti, vekalet, kampanya bilgisi ve saha planlaması birbirinden ayrılmış bir süreç olarak ele alınır."
  },
  {
    title: "Vekalet ve Kesim Süreci",
    text: "Vekalet bilgisi alınır, kesim planlaması netleştikçe kayıt altına alınır ve saha şartlarına uygun biçimde takip edilir."
  },
  {
    title: "Dağıtım ve Bilgilendirme",
    text: "Dağıtım bilgileri doğrulanan kayıtlarla hazırlanır; bağışçıya güvenli iletişim kanalları üzerinden süreç bilgisi verilir."
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
          <DonationCtaButton label="Kurban Bağışı Yap" context={{ source: "qurban" }} onlineHref="/kurban/bagis" showIcon />
          <Button href="#surec" variant="ghost" showIcon>
            Süreci İncele
          </Button>
        </div>
      </PageHero>

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <SectionHeading
              eyebrow="Kurban Organizasyonu"
              title="Vekalet, kesim ve dağıtım akışı ayrı takip edilir"
              description="Tanıtım modunda kurban bağışı için online ödeme açılmaz; bağışçı ekibimizle WhatsApp üzerinden iletişime geçerek süreç hakkında bilgi alır."
            />
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {qurbanHighlights.map((item) => (
                <article key={item.title} className="rounded-brand border border-border-soft bg-warm-white p-5 shadow-card">
                  <ShieldCheck aria-hidden className="h-6 w-6 text-ocean-green" />
                  <h2 className="mt-4 font-extrabold text-dark-navy">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading
              eyebrow="Aktif Kampanyalar"
              title="Kurban kampanyalarını inceleyin"
              description="Aktif kampanyalarda kurban türü, bölge ve başvuru sürecini inceleyerek dernek ekibinden bilgi alabilirsiniz."
            />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {campaigns.map((campaign) => (
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
                    <div className="rounded-lg bg-soft-gray p-3 text-sm font-semibold leading-6 text-ink-muted">
                      Bağış ve kontenjan bilgileri dernek ekibi tarafından doğrulanarak paylaşılır.
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button href={`/kurban/${campaign.slug}`} variant="secondary" showIcon>
                      Süreci İncele
                    </Button>
                    <DonationCtaButton
                      label="Kurban Bağışı Yap"
                      context={{ source: "qurban", campaignTitle: campaign.title }}
                      onlineHref={`/kurban/bagis?kampanya=${campaign.slug}`}
                      variant="ghost"
                    />
                  </div>
                </article>
            ))}
          </div>

          {!campaigns.length ? (
            <div className="mt-8 rounded-brand border border-border-soft bg-white p-8 text-center shadow-card">
              <h2 className="text-xl font-extrabold text-dark-navy">Aktif kurban kampanyası yok</h2>
              <p className="mt-2 text-ink-muted">Yeni kurban kampanyaları yayına alındığında bu alanda listelenecektir. Dilerseniz genel bağış çalışmalarımızı inceleyebilirsiniz.</p>
              <div className="mt-5">
                <DonationCtaButton label="Genel Bağış Sayfası" context={{ source: "general" }} onlineHref="/bagis-yap" variant="secondary" />
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
              { icon: ReceiptText, title: "Rapor Hazırlığı", text: "Dağıtım ve bilgilendirme süreçleri kayıt altında takip edilir." },
              { icon: ShieldCheck, title: "Güvenli Kapsam", text: "Başvurular kayıt altına alınır; tanıtım döneminde ekip yönlendirmesiyle ilerler." }
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
                Şeffaflık notu: Vekalet, kesim ve dağıtım süreçleri dernek yönetimi, saha ekipleri ve ilgili danışmanlık süreçleriyle emanet bilinci gözetilerek yürütülür.
                Kişisel verilerinizin işlenmesine ilişkin bilgilendirmeler için{" "}
                <Link href={getLegalPagePath("kvkk-aydinlatma-metni")} className="font-bold text-mint-green underline-offset-4 hover:underline">
                  KVKK Aydınlatma Metni
                </Link>{" "}
                ve{" "}
                <Link href={getLegalPagePath("gizlilik-politikasi")} className="font-bold text-mint-green underline-offset-4 hover:underline">
                  Gizlilik Politikası
                </Link>{" "}
                sayfalarını inceleyebilirsiniz.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
