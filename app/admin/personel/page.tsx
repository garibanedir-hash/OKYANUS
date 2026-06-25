import { listManagedUsers } from "@/lib/data/adminUsersRepository";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

function getStatusLabel(status: string) {
  return status === "active" ? "Aktif" : status === "inactive" ? "Pasif" : status;
}

export default async function AdminStaffPage() {
  const { users, error } = await listManagedUsers();
  const staff = users.filter((user) => user.accountType === "Personel" || user.accountType === "Koordinatör");
  const activeStaff = staff.filter((member) => member.status === "active").length;

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Personel Yönetimi"
        title="Personel"
        description="Personel ve koordinatör hesaplarını gerçek kullanıcı kayıtları üzerinden izleyin."
        actionLabel="Personel Davet Et"
        actionHref="/admin/ayarlar/kullanicilar"
      />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMiniStat label="Toplam personel" value={staff.length} />
        <AdminMiniStat label="Aktif personel" value={activeStaff} />
        <AdminMiniStat label="Koordinatör" value={staff.filter((member) => member.accountType === "Koordinatör").length} />
        <AdminMiniStat label="Personel" value={staff.filter((member) => member.accountType === "Personel").length} />
      </section>
      {error ? <AdminPanelNotice title="Kayıt durumu">{error}</AdminPanelNotice> : null}
      <AdminTable headers={["Ad soyad", "E-posta", "Hesap türü", "Rol", "Durum", "Birim / Görev"]} recordCount={staff.length} empty={!staff.length}>
        {staff.map((member) => (
          <tr key={member.id}>
            <td className="px-4 py-3 font-bold text-dark-navy">{member.fullName}</td>
            <td className="px-4 py-3 text-ink-muted">{member.email}</td>
            <td className="px-4 py-3 text-ink-muted">{member.accountType}</td>
            <td className="px-4 py-3 text-ink-muted">{member.role}</td>
            <td className="px-4 py-3"><AdminStatusBadge status={getStatusLabel(member.status)} /></td>
            <td className="px-4 py-3 text-ink-muted">{member.unit || "-"}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
