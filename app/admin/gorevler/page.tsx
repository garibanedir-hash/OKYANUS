import { getStaffMembers, getTaskSummary, getTasks } from "@/lib/data/adminRepository";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTaskBoard } from "@/components/admin/AdminTaskBoard";
import { AdminTaskList } from "@/components/admin/AdminTaskList";

export default function AdminTasksPage() {
  const tasks = getTasks();
  const summary = getTaskSummary();
  const staff = getStaffMembers();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Operasyon Yönetimi"
        title="Görevler"
        description="Proje, bağış, gönüllü başvurusu, iletişim mesajı ve rapor süreçleri için kurum içi görev takibi demo olarak hazırlanmıştır."
        actionLabel="Yeni Görev Ata"
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminMiniStat label="Toplam görev" value={summary.total} />
        <AdminMiniStat label="Bekleyen görev" value={summary.new} />
        <AdminMiniStat label="Devam eden" value={summary.inProgress} />
        <AdminMiniStat label="Tamamlanan" value={summary.completed} />
        <AdminMiniStat label="Geciken" value={summary.overdue} />
      </section>
      <AdminPanelNotice title="Demo görev sistemi">
        Bu ekran gerçek görev kaydı oluşturmaz. Supabase aşamasında internal_tasks, task_comments ve audit_logs tablolarına bağlanacak şekilde hazırlanmıştır.
      </AdminPanelNotice>
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Durum<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Yeni</option><option>Devam Ediyor</option><option>Gecikti</option><option>Tamamlandı</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Öncelik<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Acil</option><option>Yüksek</option><option>Orta</option><option>Düşük</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Atanan kişi<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tüm ekip</option>{staff.map((member) => <option key={member.id}>{member.fullName}</option>)}</select></label>
        <label className="text-sm font-bold text-dark-navy">İlgili modül<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Proje</option><option>Bağış</option><option>Gönüllü Başvurusu</option><option>Faaliyet Raporu</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Tarih<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Bu hafta</option><option>Bu ay</option><option>Gecikenler</option></select></label>
        <div className="flex items-end"><AdminActionButton variant="primary">Filtreleri Uygula</AdminActionButton></div>
      </AdminFilterBar>
      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <AdminTaskList tasks={tasks} />
        <AdminTaskBoard tasks={tasks} />
      </section>
    </div>
  );
}
