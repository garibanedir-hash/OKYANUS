import { listManagedUsers } from "@/lib/data/adminUsersRepository";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  return status === "active" ? "Aktif" : status === "inactive" ? "Pasif" : status;
}

export default async function AdminUsersPage() {
  const { users, error } = await listManagedUsers();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Kullanıcı Yönetimi"
        title="Kullanıcılar"
        description="Personel, koordinatör ve admin hesaplarını gerçek kullanıcı kayıtlarıyla takip edin."
        actionLabel="Kullanıcı Davet Et"
        actionHref="/admin/ayarlar/kullanicilar"
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminMiniStat label="Tüm kullanıcılar" value={users.length} />
        <AdminMiniStat label="Aktif" value={users.filter((u) => u.status === "active").length} />
        <AdminMiniStat label="Admin" value={users.filter((u) => u.accountType === "Admin").length} />
        <AdminMiniStat label="Personel" value={users.filter((u) => u.accountType === "Personel").length} />
        <AdminMiniStat label="Koordinatör" value={users.filter((u) => u.accountType === "Koordinatör").length} />
      </section>
      {error ? <AdminPanelNotice title="Kayıt durumu">{error}</AdminPanelNotice> : null}
      <AdminTable headers={["Ad soyad", "E-posta", "Hesap türü", "Rol", "Durum", "Birim / Görev", "Oluşturulma", "Güncelleme"]} recordCount={users.length} empty={!users.length}>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="px-4 py-3 font-bold text-dark-navy">{user.fullName}</td>
            <td className="px-4 py-3 text-ink-muted">{user.email}</td>
            <td className="px-4 py-3 text-ink-muted">{user.accountType}</td>
            <td className="px-4 py-3 text-ink-muted">{user.role}</td>
            <td className="px-4 py-3"><AdminStatusBadge status={getStatusLabel(user.status)} /></td>
            <td className="px-4 py-3 text-ink-muted">{user.unit || "-"}</td>
            <td className="px-4 py-3 text-ink-muted">{formatDate(user.createdAt)}</td>
            <td className="px-4 py-3 text-ink-muted">{formatDate(user.updatedAt)}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
