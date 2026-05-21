import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminSponsorships } from "@/lib/data/orphanSponsorshipRepository";
import { formatDate } from "@/lib/format";
import { formatSponsorshipMoney, PrivacyNotice, SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

export default async function AdminSponsorshipsPage() {
  const sponsorships = await getAdminSponsorships();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Yetim Hamiliği"
        title="Sponsorluklar"
        description="Sponsor, yetim güvenli özeti, ödeme ve sponsorluk durumları maskeli/read-only olarak izlenir."
      />
      <PrivacyNotice />
      <AdminFilterBar>
        <label>Sponsorluk No<input disabled placeholder="Demo filtre" /></label>
        <label>Ödeme<select disabled><option>Tümü</option><option>Ödeme bekliyor</option><option>Ödendi</option></select></label>
        <label>Durum<select disabled><option>Tümü</option><option>Aktif</option><option>Bekliyor</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Sponsorluk No", "Sponsor maskeli", "Yetim kodu/güvenli ad", "Program", "Aylık destek", "Ödeme durumu", "Sponsorluk durumu", "Başlangıç", "Son ödeme", "İşlem"]} recordCount={sponsorships.length} empty={!sponsorships.length}>
        {sponsorships.map((item) => (
          <tr key={item.id}>
            <td className="font-bold text-dark-navy">{item.sponsorshipNo}</td>
            <td>{item.sponsorDisplayName}<span className="block text-xs text-ink-muted">{item.sponsorEmailMasked}</span><span className="block text-xs text-ink-muted">{item.sponsorPhoneMasked}</span></td>
            <td>{item.orphanCode}<span className="block text-xs text-ink-muted">{item.orphanSafeName}</span></td>
            <td>{item.programTitle}</td>
            <td>{formatSponsorshipMoney(item.monthlyAmount, item.currency)}</td>
            <td><SponsorshipStatusCell status={item.paymentStatusLabel} /></td>
            <td><SponsorshipStatusCell status={item.statusLabel} /></td>
            <td>{formatDate(item.startDate)}</td>
            <td>{item.lastPaymentDate ? formatDate(item.lastPaymentDate) : "Bekliyor"}</td>
            <td><AdminActionButton>Detay demo</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
