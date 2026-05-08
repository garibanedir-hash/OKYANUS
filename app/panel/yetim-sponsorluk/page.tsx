import { getSponsoredOrphans } from "@/lib/data/portalRepository";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { SponsorshipCard } from "@/components/portal/SponsorshipCard";

export default function SponsorshipPage() {
  const sponsorships = getSponsoredOrphans();

  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Mahremiyet odaklı sponsorluk</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Yetim Sponsorluk</h1>
        <p className="mt-2 max-w-3xl leading-7 text-ink-muted">Sponsor sadece kendi sponsorluk kayıtlarını görebilir. Çocuğun tam adı, açık adresi, okul adı, kimlik bilgisi, telefon ve aile detayları gösterilmez.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <PortalStatCard label="Aktif sponsorluk" value={sponsorships.length} />
        <PortalStatCard label="Son bilgilendirme" value={sponsorships[0]?.lastUpdate ?? "-"} />
        <PortalStatCard label="Güvenlik modu" value="Sınırlı görünüm" />
      </section>
      {sponsorships.map((item) => <SponsorshipCard key={item.id} sponsorship={item} />)}
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-dark-navy">Sık sorulan sorular</h2>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-ink-muted">
          <p><strong className="text-dark-navy">Neden tam bilgi gösterilmiyor?</strong> Çocuk mahremiyeti ve güvenliği için bilgiler sınırlı paylaşılır.</p>
          <p><strong className="text-dark-navy">Destekler nasıl takip edilir?</strong> Koordinatör notları ve özet destek geçmişi üzerinden takip edilir.</p>
        </div>
      </section>
    </div>
  );
}
