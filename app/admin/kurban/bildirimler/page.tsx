import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { mockQurbanNotifications } from "@/data/qurbanMock";
import { QurbanStatusCell } from "@/app/admin/kurban/_components/QurbanAdminShared";

export default function AdminQurbanNotificationsPage() {
  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Kurban Çalışmaları"
        title="Bildirimler"
        description="Bağışçı bilgilendirme kayıtları demo olarak hazırlanır. Gerçek SMS/e-posta gönderimi bu aşamada yapılmaz."
      />
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">Veri kaynağı: Demo fallback</div>
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Sipariş<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="KRB-2026..." /></label>
        <label className="text-sm font-bold text-dark-navy">Kanal<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>E-posta</option><option>SMS</option><option>WhatsApp</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Durum<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Bekliyor</option><option>Hazır</option><option>Gönderildi</option><option>Hata</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Sipariş No", "Bağışçı", "Kanal", "Şablon", "Durum", "Gönderim tarihi", "Hata", "İşlem"]} recordCount={mockQurbanNotifications.length} empty={!mockQurbanNotifications.length}>
        {mockQurbanNotifications.map((notification) => (
          <tr key={notification.id}>
            <td className="font-bold text-dark-navy">{notification.orderNo}</td>
            <td>{notification.donorDisplayName}<span className="block text-xs text-ink-muted">{notification.donorEmailMasked}</span></td>
            <td>{notification.channelLabel}</td>
            <td>{notification.templateKey}</td>
            <td><QurbanStatusCell status={notification.statusLabel} /></td>
            <td>{notification.sentAt ?? "Bekliyor"}</td>
            <td>{notification.errorMessage ?? "-"}</td>
            <td><AdminActionButton>Gönderim demo</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
