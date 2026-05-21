import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminOrphanUpdates } from "@/lib/data/orphanSponsorshipRepository";
import { formatDate } from "@/lib/format";
import { PrivacyNotice, SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

export default async function AdminOrphanUpdatesPage() {
  const updates = await getAdminOrphanUpdates();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Yetim Hamiliği"
        title="Güncellemeler"
        description="Sponsorla paylaşılacak güvenli güncellemeler mahremiyet kontrolü gerektirir. Açık adres, okul adı ve hassas detaylar yazılmamalıdır."
      />
      <PrivacyNotice />
      <AdminFilterBar>
        <label>Yetim kodu<input disabled placeholder="Demo filtre" /></label>
        <label>Güncelleme türü<input disabled placeholder="Demo filtre" /></label>
        <label>Durum<select disabled><option>Tümü</option><option>Taslak</option><option>Yayında</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Yetim kodu", "Başlık", "Güncelleme türü", "Durum", "Yayın tarihi", "Oluşturan", "İşlem"]} recordCount={updates.length} empty={!updates.length}>
        {updates.map((update) => (
          <tr key={update.id}>
            <td className="font-bold text-dark-navy">{update.orphanCode}</td>
            <td>{update.title}<span className="block text-xs text-ink-muted">{update.summary}</span></td>
            <td>{update.updateType}</td>
            <td><SponsorshipStatusCell status={update.statusLabel} /></td>
            <td>{update.publishedAt ? formatDate(update.publishedAt) : "Yayınlanmadı"}</td>
            <td>{update.createdBy}</td>
            <td><AdminActionButton>Mahremiyet kontrolü</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
