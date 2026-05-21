import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminSponsorshipNotifications } from "@/lib/data/orphanSponsorshipRepository";
import { SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

export default async function AdminSponsorshipNotificationsPage() {
  const notifications = await getAdminSponsorshipNotifications();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Yetim Hamiliği"
        title="Bildirimler"
        description="Sponsor bilgilendirme kayıtları demo olarak hazırlanır. Gerçek SMS/e-posta gönderimi bu aşamada yapılmaz."
      />
      <AdminFilterBar>
        <label>Sponsorluk<input disabled placeholder="Demo filtre" /></label>
        <label>Kanal<select disabled><option>Tümü</option><option>E-posta</option><option>SMS</option></select></label>
        <label>Durum<select disabled><option>Tümü</option><option>Bekliyor</option><option>Hazır</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Sponsorluk No", "Sponsor maskeli", "Kanal", "Şablon", "Durum", "Gönderim tarihi", "Hata", "İşlem"]} recordCount={notifications.length} empty={!notifications.length}>
        {notifications.map((notification) => (
          <tr key={notification.id}>
            <td className="font-bold text-dark-navy">{notification.sponsorshipNo}</td>
            <td>{notification.sponsorDisplayName}<span className="block text-xs text-ink-muted">{notification.sponsorEmailMasked}</span></td>
            <td>{notification.channelLabel}</td>
            <td>{notification.templateKey}</td>
            <td><SponsorshipStatusCell status={notification.statusLabel} /></td>
            <td>{notification.sentAt ?? "Bekliyor"}</td>
            <td>{notification.errorMessage ?? "-"}</td>
            <td><AdminActionButton>Gönderim demo</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
