import type { MockSponsoredOrphan } from "@/data/portalMock";
import { AdminActionButton } from "@/components/admin/AdminActionButton";

export function SponsorshipCard({ sponsorship }: { sponsorship: MockSponsoredOrphan }) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ocean-green">{sponsorship.sponsorshipCode}</p>
          <h2 className="mt-2 text-2xl font-bold text-dark-navy">{sponsorship.maskedName}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">Çocuk mahremiyeti nedeniyle bazı bilgiler güvenlik amacıyla sınırlı gösterilir.</p>
        </div>
        <span className="rounded-full bg-mint-green px-3 py-1 text-xs font-extrabold text-ocean-green">{sponsorship.supportStatus}</span>
      </div>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="font-bold text-dark-navy">Yaş aralığı</dt><dd className="text-ink-muted">{sponsorship.ageRange}</dd></div>
        <div><dt className="font-bold text-dark-navy">Bölge</dt><dd className="text-ink-muted">{sponsorship.region}</dd></div>
        <div><dt className="font-bold text-dark-navy">Eğitim durumu</dt><dd className="text-ink-muted">{sponsorship.educationStatus}</dd></div>
        <div><dt className="font-bold text-dark-navy">Son bilgilendirme</dt><dd className="text-ink-muted">{sponsorship.lastUpdate}</dd></div>
      </dl>
      <div className="mt-5 grid gap-3 rounded-2xl bg-soft-gray p-4 text-sm leading-6 text-ink-muted">
        <p><strong className="text-dark-navy">Genel gelişim:</strong> {sponsorship.developmentNote}</p>
        <p><strong className="text-dark-navy">Eğitim desteği:</strong> {sponsorship.educationNote}</p>
        <p><strong className="text-dark-navy">Temel ihtiyaç:</strong> {sponsorship.wellbeingNote}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <AdminActionButton>Sponsorluk Detayı</AdminActionButton>
        <AdminActionButton>Destek Geçmişi</AdminActionButton>
        <AdminActionButton variant="primary">Yeni Destek Ekle</AdminActionButton>
        <AdminActionButton>Koordinatöre Mesaj Gönder</AdminActionButton>
      </div>
    </article>
  );
}
