import { ShieldCheck } from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import {
  getDonorSponsoredOrphans,
  getDonorSponsorships
} from "@/lib/data/orphanSponsorshipRepository";
import { formatDate } from "@/lib/format";
import { formatSponsorshipMoney, SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

export default async function SponsorshipPage() {
  const sponsorships = await getDonorSponsorships("demo-donor-account");
  const sponsoredOrphans = await getDonorSponsoredOrphans("demo-donor-account");
  const firstUpdate = sponsoredOrphans.find((item) => item.lastUpdate)?.lastUpdate;

  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Mahremiyet odaklı sponsorluk</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Yetim Sponsorluklarım</h1>
        <p className="mt-2 max-w-3xl leading-7 text-ink-muted">
          Sponsor yalnızca kendi sponsorluk kayıtlarını ve güvenli yetim özetlerini görebilir. Çocuğun tam adı, açık adresi, okul adı, kimlik bilgisi, telefon ve aile detayları gösterilmez.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <PortalStatCard label="Aktif sponsorluk" value={sponsorships.filter((item) => item.status === "active").length} />
        <PortalStatCard label="Son güncelleme" value={firstUpdate ? formatDate(firstUpdate) : "-"} />
        <PortalStatCard label="Güvenlik modu" value="Sınırlı görünüm" />
      </section>

      <AdminTable headers={["Sponsorluk No", "Yetim kodu", "Güvenli ad", "Yaş grubu", "Bölge", "Eğitim", "Aylık destek", "Ödeme", "Sonraki destek", "Durum"]} recordCount={sponsorships.length} empty={!sponsorships.length}>
        {sponsorships.map((item) => {
          const orphan = sponsoredOrphans.find((safe) => safe.sponsorshipId === item.id);
          return (
            <tr key={item.id}>
              <td className="font-bold text-dark-navy">{item.sponsorshipNo}</td>
              <td>{item.orphanCode}</td>
              <td>{item.orphanSafeName}</td>
              <td>{orphan?.ageGroup ?? "Sınırlı"}</td>
              <td>{orphan?.country ?? "Sınırlı"}<span className="block text-xs text-ink-muted">{orphan?.cityOrRegion ?? "Bölge sınırlı"}</span></td>
              <td>{orphan?.educationStatus ?? "Sınırlı"}</td>
              <td>{formatSponsorshipMoney(item.monthlyAmount, item.currency)}</td>
              <td><SponsorshipStatusCell status={item.paymentStatusLabel} /></td>
              <td>{item.nextPaymentDate ? formatDate(item.nextPaymentDate) : "Ödeme altyapısı bekleniyor"}</td>
              <td><SponsorshipStatusCell status={item.statusLabel} /></td>
            </tr>
          );
        })}
      </AdminTable>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
          <h2 className="text-xl font-bold text-dark-navy">Güvenli güncelleme özeti</h2>
          <div className="mt-4 grid gap-3">
            {sponsoredOrphans.map((orphan) => (
              <article key={orphan.sponsorshipId} className="rounded-lg bg-soft-gray p-4">
                <p className="text-xs font-extrabold uppercase text-ocean-green">{orphan.code}</p>
                <h3 className="mt-1 font-extrabold text-dark-navy">{orphan.safeName}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{orphan.generalHealthNote}</p>
                <p className="mt-2 text-xs font-bold text-ink-muted">Son güncelleme: {orphan.lastUpdate ? formatDate(orphan.lastUpdate) : "Henüz paylaşılmadı"}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
          <ShieldCheck aria-hidden className="h-6 w-6 text-ocean-green" />
          <h2 className="mt-4 text-xl font-bold text-dark-navy">Güvenli bilgi paylaşımı</h2>
          <div className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-ink-muted">
            <p>Gösterilen bilgiler: yetim kodu, güvenli ad/rumuz, yaş grubu, ülke/bölge, eğitim durumu ve güncelleme tarihi.</p>
            <p>Gösterilmeyen bilgiler: açık adres, okul adı, kimlik numarası, telefon, aile detayları, hassas sağlık verisi ve izinsiz fotoğraf.</p>
            <p>Makbuz ve gerçek ödeme takibi ödeme entegrasyonu sonrası aktifleşecektir.</p>
          </div>
          <div className="mt-5">
            <Button href="/yetim-hamiligi/basvuru" variant="secondary">
              Yeni Başvuru
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
