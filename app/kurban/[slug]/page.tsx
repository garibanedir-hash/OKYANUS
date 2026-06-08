import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, ClipboardCheck, MapPin, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { getActiveQurbanCampaigns, getQurbanCampaignBySlug } from "@/lib/data/qurbanRepository";
import { formatCurrency, formatDate } from "@/lib/format";
import { DonationCtaButton } from "@/components/donations/DonationCtaButton";

type QurbanDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: QurbanDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getQurbanCampaignBySlug(slug);

  if (!campaign) {
    return {
      title: "Kurban Kampanyası"
    };
  }

  return {
    title: campaign.title,
    description: campaign.shortDescription
  };
}

export default async function QurbanCampaignDetailPage({ params }: QurbanDetailPageProps) {
  const { slug } = await params;
  const campaign = await getQurbanCampaignBySlug(slug);
  const activeCampaigns = await getActiveQurbanCampaigns();

  if (!campaign) {
    notFound();
  }

  const reservedRatio = campaign.quotaTotal > 0 ? Math.min(100, Math.round((campaign.quotaReserved / campaign.quotaTotal) * 100)) : 0;
  const completedRatio = campaign.quotaTotal > 0 ? Math.min(100, Math.round((campaign.quotaCompleted / campaign.quotaTotal) * 100)) : 0;
  const remainingQuota = campaign.quotaTotal > 0 ? Math.max(0, campaign.quotaTotal - campaign.quotaReserved) : null;
  const isCampaignOpen = campaign.status === "active";
  const hasAvailableQuota = remainingQuota === null || remainingQuota > 0;
  const canDonate = isCampaignOpen && hasAvailableQuota;
  const donationHref = `/kurban/bagis?kampanya=${encodeURIComponent(campaign.slug)}`;
  const delegationPreview =
    campaign.delegationText.length > 360
      ? `${campaign.delegationText.slice(0, 360).trim()}...`
      : campaign.delegationText;
  const relatedCampaigns = activeCampaigns.filter((item) => item.slug !== campaign.slug).slice(0, 2);

  return (
    <>
      <PageHero
        eyebrow={`${campaign.typeLabel} · ${campaign.regionLabel}`}
        title={campaign.title}
        description={campaign.shortDescription}
      >
        <div className="flex flex-wrap gap-3">
          {canDonate ? (
            <DonationCtaButton
              label="Bu Kampanyaya Kurban Bağışı Yap"
              context={{ source: "qurban", campaignTitle: campaign.title }}
              onlineHref={donationHref}
              showIcon
            />
          ) : null}
          <Button href="/kurban" variant="ghost">
            Tüm Kurban Çalışmaları
          </Button>
        </div>
      </PageHero>

      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <article className="rounded-brand border border-border-soft bg-white p-7 shadow-card">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: MapPin, label: "Bölge/ülke", value: `${campaign.country} · ${campaign.cityOrRegion}` },
                  { icon: CalendarDays, label: "Tarih aralığı", value: `${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)}` },
                  { icon: ClipboardCheck, label: "Kurban türü", value: campaign.typeLabel },
                  { icon: ShieldCheck, label: "Birim bedel", value: formatCurrency(campaign.unitPrice) },
                  { icon: ClipboardCheck, label: "Kontenjan", value: campaign.quotaTotal > 0 ? `${campaign.quotaTotal} hisse/adet` : "Kontenjan bilgisi güncellenecek" },
                  { icon: CheckCircle2, label: "Kalan", value: remainingQuota === null ? "Kontenjan bilgisi güncellenecek" : `${remainingQuota} hisse/adet` }
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-lg bg-soft-gray p-4">
                    <Icon aria-hidden className="h-5 w-5 text-ocean-green" />
                    <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.1em] text-ink-muted">{label}</p>
                    <p className="mt-1 font-extrabold text-dark-navy">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <h2 className="text-xl font-extrabold text-dark-navy">Kampanya Detayı</h2>
                <p className="mt-3 leading-8 text-ink-muted">{campaign.description}</p>
              </div>

              <div className="mt-7 rounded-lg border border-border-soft bg-soft-gray p-5">
                <h2 className="text-lg font-extrabold text-dark-navy">Vekalet Metni Önizlemesi</h2>
                <p className="mt-3 text-sm leading-7 text-ink-muted">{delegationPreview}</p>
                <p className="mt-3 text-xs font-bold leading-6 text-ink-muted">
                  Bu önizleme taslak niteliktedir; production öncesi dernek yönetimi, hukuk danışmanı ve dini danışman onayı gerekir.
                </p>
              </div>

              <div className="mt-7 rounded-lg border border-ocean-green/20 bg-mint-green/40 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 text-ocean-green" />
                  <p className="text-sm font-semibold leading-7 text-dark-navy">{campaign.transparencyNote}</p>
                </div>
              </div>
            </article>

            <aside className="grid gap-5">
              <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <h2 className="text-xl font-extrabold text-dark-navy">Kontenjan Durumu</h2>
                <div className="mt-5 grid gap-4">
                  <div>
                    <div className="flex justify-between text-sm font-bold text-ink-muted">
                      <span>Rezerve</span>
                      <span>{campaign.quotaReserved}/{campaign.quotaTotal}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-soft-gray">
                      <div className="h-full rounded-full bg-ocean-green" style={{ width: `${reservedRatio}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-ink-muted">
                      <span>Tamamlanan</span>
                      <span>{campaign.quotaCompleted}/{campaign.quotaTotal}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-soft-gray">
                      <div className="h-full rounded-full bg-deep-blue" style={{ width: `${completedRatio}%` }} />
                    </div>
                  </div>
                </div>
                {canDonate ? (
                  <DonationCtaButton
                    label="Kurban Bağışı Akışına Geç"
                    context={{ source: "qurban", campaignTitle: campaign.title }}
                    onlineHref={donationHref}
                    className="mt-6 w-full"
                    showIcon
                  />
                ) : (
                  <div className="mt-6 rounded-lg border border-border-soft bg-soft-gray p-4 text-sm font-semibold leading-6 text-ink-muted">
                    {isCampaignOpen
                      ? "Bu kampanyada şu an uygun kontenjan bulunmuyor. Yeni kontenjan açıldığında bağış akışı yeniden aktif edilir."
                      : "Bu kampanya bağış başvurusuna açık değildir. Aktif kampanyalar üzerinden başvuru oluşturabilirsiniz."}
                  </div>
                )}
              </div>

              <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <h2 className="text-xl font-extrabold text-dark-navy">Süreç Bilgisi</h2>
                <ol className="mt-4 grid gap-3 text-sm font-semibold text-ink-muted">
                  {["Vekalet onayı", "Ödeme durum takibi", "Kesim planlama", "Dağıtım ve bilgilendirme"].map((item, index) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-soft-blue text-xs font-black text-deep-blue">{index + 1}</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>

              {relatedCampaigns.length ? (
                <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                  <h2 className="text-xl font-extrabold text-dark-navy">Diğer Aktif Kampanyalar</h2>
                  <div className="mt-4 grid gap-3">
                    {relatedCampaigns.map((item) => (
                      <Link key={item.id} href={`/kurban/${item.slug}`} className="focus-ring rounded-lg border border-border-soft p-4 hover:bg-soft-gray">
                        <p className="text-xs font-extrabold uppercase text-ocean-green">{item.typeLabel}</p>
                        <p className="mt-1 font-extrabold text-dark-navy">{item.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
