import type { Metadata } from "next";
import { AlertCircle, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { getActiveQurbanCampaigns } from "@/lib/data/qurbanRepository";
import { qurbanTypeLabels } from "@/data/qurbanMock";
import { submitQurbanDonationDemoAction } from "@/app/kurban/bagis/actions";

export const metadata: Metadata = {
  title: "Kurban Bağışı Demo Akışı",
  description: "Kurban bağışı için demo vekalet ve ön kayıt formu. Gerçek ödeme veya kayıt oluşturmaz."
};

type QurbanDonationPageProps = {
  searchParams?: Promise<{ durum?: string; kampanya?: string }>;
};

export default async function QurbanDonationDemoPage({ searchParams }: QurbanDonationPageProps) {
  const params = await searchParams;
  const campaigns = await getActiveQurbanCampaigns();
  const selectedCampaign = campaigns.find((campaign) => campaign.slug === params?.kampanya);

  return (
    <>
      <PageHero
        eyebrow="Demo Ön Kayıt"
        title="Kurban bağışı ve vekalet akışı"
        description="Bu ekran kurban bağışı, vekalet onayı ve iletişim bilgisi akışını gösterir. Bu aşamada gerçek kayıt, ödeme veya makbuz oluşturulmaz."
      />

      <section className="bg-soft-gray py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-start">
            <form action={submitQurbanDonationDemoAction} className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
              {params?.durum === "demo" ? (
                <div className="mb-6 rounded-lg border border-ocean-green/20 bg-mint-green/50 p-4 text-sm font-bold leading-6 text-dark-navy">
                  Kurban bağış akışı ödeme entegrasyonu tamamlandığında aktif hale gelecektir.
                </div>
              ) : null}

              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-bold text-dark-navy">
                  Kurban türü
                  <select name="qurbanType" defaultValue={selectedCampaign?.type ?? "vacip"} className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3">
                    {Object.entries(qurbanTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-bold text-dark-navy">
                  Kampanya
                  <select name="campaign" defaultValue={selectedCampaign?.slug ?? campaigns[0]?.slug} className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3">
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.slug}>{campaign.title}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-bold text-dark-navy">
                  Hisse/adet
                  <input name="shareCount" type="number" min="1" defaultValue="1" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-dark-navy">
                  Ad soyad
                  <input name="fullName" required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="Demo bağışçı" />
                </label>
                <label className="text-sm font-bold text-dark-navy">
                  E-posta
                  <input name="email" type="email" required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="ornek@example.org" />
                </label>
                <label className="text-sm font-bold text-dark-navy">
                  Telefon
                  <input name="phone" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="+90 5** *** ** **" />
                </label>
                <label className="text-sm font-bold text-dark-navy">
                  Şehir
                  <input name="city" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="İl bilgisi" />
                </label>
                <label className="text-sm font-bold text-dark-navy md:col-span-2">
                  Not
                  <textarea name="note" rows={4} className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="Kurban niyeti veya bilgilendirme tercihi" />
                </label>
              </div>

              <div className="mt-6 rounded-lg border border-border-soft bg-soft-gray p-5">
                <h2 className="text-lg font-extrabold text-dark-navy">Vekalet Metni</h2>
                <p className="mt-3 text-sm leading-7 text-ink-muted">
                  Bu taslak metin, bağışçının kurban kesimi ve dağıtımı için Okyanus İnsani Yardım Derneği&apos;ni vekil tayin ettiğini belirtir. Production öncesinde dernek yönetimi, hukuk danışmanı ve dini danışman tarafından onaylanmalıdır.
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                <label className="flex items-start gap-3 text-sm font-semibold leading-6 text-ink-muted">
                  <input name="delegationAccepted" type="checkbox" required className="mt-1 h-4 w-4 accent-ocean-green" />
                  Vekalet metnini okudum ve demo akış kapsamında onaylıyorum.
                </label>
                <label className="flex items-start gap-3 text-sm font-semibold leading-6 text-ink-muted">
                  <input name="kvkkAccepted" type="checkbox" required className="mt-1 h-4 w-4 accent-ocean-green" />
                  KVKK bilgilendirmesi kapsamında demo form bilgisinin gerçek kayıt oluşturmadığını biliyorum.
                </label>
              </div>

              <button type="submit" className="focus-ring mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ocean-green px-5 py-3 text-sm font-extrabold text-white transition hover:bg-deep-blue">
                Demo Akışı Tamamla
              </button>
            </form>

            <aside className="grid gap-5">
              <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <div className="flex items-start gap-3">
                  <AlertCircle aria-hidden className="mt-1 h-5 w-5 text-ocean-green" />
                  <div>
                    <h2 className="text-xl font-extrabold text-dark-navy">Bu aşamada gerçek işlem yok</h2>
                    <p className="mt-2 text-sm leading-7 text-ink-muted">
                      Form submit işlemi Supabase&apos;e insert yapmaz, ödeme başlatmaz ve makbuz üretmez. Sadece kullanıcı deneyimi ve vekalet akışını göstermek için hazırlanmıştır.
                    </p>
                  </div>
                </div>
              </div>
              {[
                { icon: FileCheck2, title: "Vekalet", text: "Metin taslak olup onay süreci gerektirir." },
                { icon: ShieldCheck, title: "KVKK", text: "Production öncesi veri işleme metinleri gözden geçirilmelidir." },
                { icon: CheckCircle2, title: "Operasyon", text: "Kesim ve dağıtım takibi sonraki aşamada write action ile bağlanacaktır." }
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
                  <Icon aria-hidden className="h-5 w-5 text-ocean-green" />
                  <h3 className="mt-3 font-extrabold text-dark-navy">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{text}</p>
                </div>
              ))}
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
