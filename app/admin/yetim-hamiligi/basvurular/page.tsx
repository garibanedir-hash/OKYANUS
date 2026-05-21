import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminSponsorships } from "@/lib/data/orphanSponsorshipRepository";
import { formatDate } from "@/lib/format";
import { formatSponsorshipMoney, SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

export default async function AdminSponsorshipApplicationsPage() {
  const applications = (await getAdminSponsorships()).filter((item) => ["pending", "payment_pending"].includes(item.status));

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Yetim Hamiliği"
        title="Başvurular"
        description="Bu aşamada başvuru listesi demo/read-only sponsorluk kayıtlarından türetilir. Gerçek başvuru write akışı sonraki aşamada açılacaktır."
      />
      <AdminFilterBar>
        <label>Başvuru No<input disabled placeholder="Demo filtre" /></label>
        <label>Program<input disabled placeholder="Demo filtre" /></label>
        <label>Durum<select disabled><option>Tümü</option><option>Bekliyor</option><option>Ödeme bekliyor</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Başvuru No", "Başvuran maskeli", "Program", "Tutar", "Durum", "Tarih", "İşlem"]} recordCount={applications.length} empty={!applications.length}>
        {applications.map((item) => (
          <tr key={item.id}>
            <td className="font-bold text-dark-navy">{item.sponsorshipNo}</td>
            <td>{item.sponsorDisplayName}<span className="block text-xs text-ink-muted">{item.sponsorEmailMasked}</span></td>
            <td>{item.programTitle}</td>
            <td>{formatSponsorshipMoney(item.monthlyAmount, item.currency)}</td>
            <td><SponsorshipStatusCell status={item.statusLabel} /></td>
            <td>{formatDate(item.startDate)}</td>
            <td><AdminActionButton>İnceleme demo</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
