import { getStaffMembers, getTaskSummary } from "@/lib/data/adminRepository";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStaffCard } from "@/components/admin/AdminStaffCard";

export default function AdminStaffPage() {
  const staff = getStaffMembers();
  const taskSummary = getTaskSummary();
  const activeStaff = staff.filter((member) => member.status === "Aktif").length;

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Personel Yönetimi"
        title="Personel"
        description="Admin rolleri, sorumluluk alanları, son aktivite ve görev yoğunluğunu takip etmek için frontend önizleme ekranıdır."
        actionLabel="Personel Davet Et"
      />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMiniStat label="Toplam personel" value={staff.length} />
        <AdminMiniStat label="Aktif personel" value={activeStaff} />
        <AdminMiniStat label="Açık görev" value={taskSummary.total - taskSummary.completed} />
        <AdminMiniStat label="Tamamlanan görev" value={taskSummary.completed} />
      </section>
      <AdminPanelNotice title="Rol ve yetki hazırlığı">
        Personel yönetimi gerçek kullanımda Supabase Auth, profiles, admin_roles, RBAC ve audit log kontrolleriyle korunmalıdır.
      </AdminPanelNotice>
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Rol<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tüm roller</option><option>Super Admin</option><option>Bağış Sorumlusu</option><option>Gönüllü Koordinatörü</option><option>Raporlama Sorumlusu</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Durum<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Aktif</option><option>Meşgul</option><option>İzinli</option><option>Pasif</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Sorumluluk alanı<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="Bağış, rapor, saha..." /></label>
      </AdminFilterBar>
      <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {staff.map((member) => <AdminStaffCard key={member.id} staff={member} />)}
      </section>
    </div>
  );
}
