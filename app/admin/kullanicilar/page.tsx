import { getUserAccounts } from "@/lib/data/accessRepository";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminUsersPage() {
  const users = getUserAccounts();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader eyebrow="Kullanıcı Yönetimi" title="Kullanıcılar" description="Bağışçı, gönüllü, personel, koordinatör ve admin hesaplarını yönetmeye hazır demo ekran." actionLabel="Kullanıcı Davet Et" />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminMiniStat label="Tüm kullanıcılar" value={users.length} />
        <AdminMiniStat label="Bağışçılar" value={users.filter((u) => u.accountType.includes("Bağışçı")).length} />
        <AdminMiniStat label="Gönüllüler" value={users.filter((u) => u.accountType.includes("Gönüllü")).length} />
        <AdminMiniStat label="Personeller" value={users.filter((u) => u.accountType === "Personel").length} />
        <AdminMiniStat label="Koordinatörler" value={users.filter((u) => u.accountType === "Koordinatör").length} />
      </section>
      <AdminPanelNotice title="Demo kullanıcı işlemleri">Rol atama, yetki düzenleme, panel erişimi, şifre sıfırlama ve KVKK veri talebi işlemleri gerçek kayıt oluşturmaz; production aşamasında audit log’a düşmelidir.</AdminPanelNotice>
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Hesap türü<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Bağışçı</option><option>Gönüllü</option><option>Personel</option><option>Koordinatör</option><option>Admin</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Rol<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Super Admin</option><option>Bağış Sorumlusu</option><option>Gönüllü Koordinatörü</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Arama<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="Ad, e-posta..." /></label>
      </AdminFilterBar>
      <AdminTable headers={["Ad soyad", "E-posta", "Telefon", "Hesap türü", "Rol", "Durum", "Son giriş", "Profil", "İşlemler"]}>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="px-4 py-3 font-bold text-dark-navy">{user.fullName}</td>
            <td className="px-4 py-3 text-ink-muted">{user.email}</td>
            <td className="px-4 py-3 text-ink-muted">{user.phone}</td>
            <td className="px-4 py-3 text-ink-muted">{user.accountType}</td>
            <td className="px-4 py-3 text-ink-muted">{user.role}</td>
            <td className="px-4 py-3"><AdminStatusBadge status={user.status} /></td>
            <td className="px-4 py-3 text-ink-muted">{user.lastLogin}</td>
            <td className="px-4 py-3 font-bold text-deep-blue">%{user.profileCompletion}</td>
            <td className="px-4 py-3"><div className="flex flex-wrap gap-2"><AdminActionButton>Rol Ata</AdminActionButton><AdminActionButton>Yetki</AdminActionButton><AdminActionButton>KVKK Talebi</AdminActionButton></div></td>
          </tr>
        ))}
      </AdminTable>
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-dark-navy">Kullanıcı düzenleme paneli demo</h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">Temel bilgiler, iletişim, rol/hesap tipi, panel erişimi, yetki alanları, notlar ve durum alanları production modal/form yapısına hazırlandı.</p>
      </section>
    </div>
  );
}
