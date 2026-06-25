import type { Metadata } from "next";
import { ShieldCheck, UserPlus } from "lucide-react";
import { inviteManagedUserAction, setManagedUserStatusAction } from "@/app/admin/ayarlar/kullanicilar/actions";
import {
  listManagedUsers,
  managedUserRoles,
  managedUserStatusOptions,
  type ManagedUserAccount
} from "@/lib/data/adminUsersRepository";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export const metadata: Metadata = {
  title: "Kullanıcı ve Personel Yönetimi | Admin Panel",
  description: "Okyanus İnsani Yardım Derneği yetkili kullanıcı ve personel yönetimi."
};

const statusMessages: Record<string, string> = {
  "davet-olusturuldu": "Kullanıcı daveti oluşturuldu.",
  "aktif-edildi": "Kullanıcı aktif hale getirildi.",
  "pasife-alindi": "Kullanıcı pasif hale getirildi."
};

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

function UserStatusAction({ user }: { user: ManagedUserAccount }) {
  const nextStatus = user.status === "active" ? "inactive" : "active";

  return (
    <form action={setManagedUserStatusAction}>
      <input type="hidden" name="id" value={user.id} />
      <input type="hidden" name="status" value={nextStatus} />
      <button
        type="submit"
        className="focus-ring inline-flex min-h-8 items-center rounded-md border border-border-soft bg-white px-2.5 py-1 text-[0.72rem] font-extrabold text-deep-blue transition hover:bg-soft-blue"
      >
        {nextStatus === "active" ? "Aktif Et" : "Pasifleştir"}
      </button>
    </form>
  );
}

export default async function AdminManagedUsersPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const { users, error } = await listManagedUsers();
  const activeUsers = users.filter((user) => user.status === "active").length;
  const staffUsers = users.filter((user) => user.accountType === "Personel").length;
  const coordinatorUsers = users.filter((user) => user.accountType === "Koordinatör").length;
  const adminUsers = users.filter((user) => user.accountType === "Admin").length;

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Ayarlar"
        title="Kullanıcı ve Personel Yönetimi"
        description="Yetkili kullanıcılar, personel ve koordinatör hesapları server-side güvenlik kontrolüyle davet edilir."
      />

      {params.durum === "hata" ? (
        <div className="rounded-lg border border-warm-accent/30 bg-warm-accent/10 px-4 py-3 text-sm font-bold text-dark-navy">
          {params.mesaj ?? "İşlem tamamlanamadı."}
        </div>
      ) : params.durum && statusMessages[params.durum] ? (
        <div className="rounded-lg border border-ocean-green/25 bg-mint-green px-4 py-3 text-sm font-bold text-ocean-green">
          {statusMessages[params.durum]}
        </div>
      ) : null}

      {error ? <AdminPanelNotice title="Kayıt durumu">{error}</AdminPanelNotice> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMiniStat label="Toplam hesap" value={users.length} />
        <AdminMiniStat label="Aktif hesap" value={activeUsers} />
        <AdminMiniStat label="Personel" value={staffUsers} />
        <AdminMiniStat label="Koordinatör" value={coordinatorUsers + adminUsers} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <form action={inviteManagedUserAction} className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-soft-blue text-deep-blue">
              <UserPlus aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-dark-navy">Yeni kullanıcı davet et</h2>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                Davet güvenli sunucu akışıyla oluşturulur. Sabit veya paylaşılan şifre üretilmez.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="text-sm font-bold text-dark-navy">
              Ad Soyad
              <input name="fullName" required minLength={3} className="focus-ring mt-2 w-full rounded-md border border-border-soft px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-bold text-dark-navy">
              E-posta
              <input name="email" type="email" required className="focus-ring mt-2 w-full rounded-md border border-border-soft px-3 py-2 text-sm" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold text-dark-navy">
                Rol
                <select name="role" required defaultValue="staff" className="focus-ring mt-2 w-full rounded-md border border-border-soft px-3 py-2 text-sm">
                  {managedUserRoles.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold text-dark-navy">
                Durum
                <select name="status" required defaultValue="active" className="focus-ring mt-2 w-full rounded-md border border-border-soft px-3 py-2 text-sm">
                  {managedUserStatusOptions.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="text-sm font-bold text-dark-navy">
              Birim / Görev
              <input name="unit" className="focus-ring mt-2 w-full rounded-md border border-border-soft px-3 py-2 text-sm" placeholder="Örn. saha koordinasyonu" />
            </label>
            <label className="text-sm font-bold text-dark-navy">
              Opsiyonel not
              <textarea name="note" rows={3} className="focus-ring mt-2 w-full rounded-md border border-border-soft px-3 py-2 text-sm" placeholder="Kurum içi kısa not" />
            </label>
            <button type="submit" className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-deep-blue px-4 py-2 text-sm font-extrabold text-white transition hover:bg-dark-navy">
              Davet Oluştur
            </button>
          </div>
        </form>

        <section className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint-green text-ocean-green">
              <ShieldCheck aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-dark-navy">Güvenlik notu</h2>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                Kullanıcı oluşturma işlemi yalnızca yetkili admin oturumuyla çalışır. Service role anahtarı tarayıcı tarafına taşınmaz.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm leading-6 text-ink-muted">
            <p>Yeni hesaplar davet akışıyla açılır; e-posta teslimatı production giriş sağlayıcısı ayarlarına bağlıdır.</p>
            <p>Hard delete yerine hesap durumu güncellenir. Böylece audit ve geçmiş kayıt ilişkileri korunur.</p>
          </div>
        </section>
      </section>

      <AdminTable headers={["Ad Soyad", "E-posta", "Hesap Türü", "Rol", "Durum", "Birim / Görev", "Oluşturulma", "Güncelleme", "İşlem"]} recordCount={users.length} empty={!users.length}>
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
            <td className="px-4 py-3"><UserStatusAction user={user} /></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
