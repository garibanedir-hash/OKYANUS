import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminChartCard } from "@/components/admin/AdminChartCard";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import {
  getAdminOrphanUpdates,
  getAdminSponsorshipStats,
  getAdminSponsorships
} from "@/lib/data/orphanSponsorshipRepository";
import { formatDate } from "@/lib/format";
import { formatSponsorshipMoney, PrivacyNotice, SponsorshipStatGrid, SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

export default async function AdminOrphanSponsorshipPage() {
  const stats = await getAdminSponsorshipStats();
  const sponsorships = await getAdminSponsorships();
  const updates = await getAdminOrphanUpdates();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Yetim Hamiliği"
        title="Sponsorluk Operasyon Merkezi"
        description="Yetim profilleri, sponsorluklar, güvenli güncellemeler ve saha görevleri read-only demo kapsamda izlenir. Gerçek ödeme, belge ve bildirim işlemleri kapalıdır."
      />
      <PrivacyNotice />
      <SponsorshipStatGrid
        items={[
          { label: "Toplam yetim profili", value: stats.totalOrphans },
          { label: "Sponsor bekleyen", value: stats.waitingForSponsor },
          { label: "Aktif sponsorluk", value: stats.activeSponsorships },
          { label: "Ödeme bekleyen", value: stats.paymentPending },
          { label: "Güncelleme bekleyen", value: stats.updatesPending },
          { label: "Görev bekleyen", value: stats.assignmentsPending }
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminTable headers={["Sponsorluk No", "Sponsor", "Yetim", "Aylık destek", "Ödeme", "Durum", "Başlangıç"]} recordCount={sponsorships.slice(0, 5).length} empty={!sponsorships.length}>
          {sponsorships.slice(0, 5).map((item) => (
            <tr key={item.id}>
              <td className="font-bold text-dark-navy">{item.sponsorshipNo}</td>
              <td>{item.sponsorDisplayName}<span className="block text-xs text-ink-muted">{item.sponsorEmailMasked}</span></td>
              <td>{item.orphanCode}<span className="block text-xs text-ink-muted">{item.orphanSafeName}</span></td>
              <td>{formatSponsorshipMoney(item.monthlyAmount, item.currency)}</td>
              <td><SponsorshipStatusCell status={item.paymentStatusLabel} /></td>
              <td><SponsorshipStatusCell status={item.statusLabel} /></td>
              <td>{formatDate(item.startDate)}</td>
            </tr>
          ))}
        </AdminTable>

        <AdminChartCard title="Son güvenli güncellemeler" description="Yayın öncesi mahremiyet kontrolü gerekir.">
          <div className="grid gap-3">
            {updates.slice(0, 4).map((update) => (
              <div key={update.id} className="rounded-lg border border-border-soft bg-soft-gray p-4">
                <p className="text-xs font-extrabold uppercase text-ocean-green">{update.orphanCode}</p>
                <h2 className="mt-1 font-extrabold text-dark-navy">{update.title}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-muted">{update.summary}</p>
                <div className="mt-2"><SponsorshipStatusCell status={update.statusLabel} /></div>
              </div>
            ))}
          </div>
        </AdminChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AdminChartCard title="Bölge/ülke dağılımı" description="Raporlama hazırlığı için güvenli kırılım.">
          <div className="grid gap-3">
            {stats.countryBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-soft-gray p-4">
                <span className="font-extrabold text-dark-navy">{item.label}</span>
                <span className="text-sm font-black text-deep-blue">{item.value} profil</span>
              </div>
            ))}
          </div>
        </AdminChartCard>
        <AdminChartCard title="Mahremiyet uyarıları" description="Yetim hamiliği modülünde görünürlük minimum olmalıdır.">
          <div className="grid gap-3 text-sm font-semibold leading-6 text-ink-muted">
            <p>Public alanda çocuk profili gösterilmez.</p>
            <p>Sponsor panelinde yalnızca güvenli özet görünür.</p>
            <p>Fotoğraf kullanımı açık rıza ve kurum politikası olmadan açılmaz.</p>
            <div className="mt-2"><AdminActionButton href="/admin/yetim-hamiligi/export">Export Hazırlığı</AdminActionButton></div>
          </div>
        </AdminChartCard>
      </section>
    </div>
  );
}
