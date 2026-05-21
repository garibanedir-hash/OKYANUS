import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getStaffQurbanTasks } from "@/lib/data/qurbanRepository";
import { formatDate } from "@/lib/format";
import { QurbanProgress, QurbanStatusCell } from "@/app/admin/kurban/_components/QurbanAdminShared";

export default async function StaffQurbanTasksPage() {
  const tasks = await getStaffQurbanTasks("demo-staff-account");

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Personel Paneli"
        title="Kurban Görevleri"
        description="Size atanan kurban kesim/dağıtım görevleri demo/read-only olarak listelenir. Rapor girilecek alan bu aşamada gerçek kayıt oluşturmaz."
      />
      <div className="rounded-lg border border-border-soft bg-white p-4 text-sm font-semibold leading-6 text-ink-muted shadow-sm">
        Bu ekran görev ve saha takip mantığını gösterir; bağışçı kişisel verisi veya hassas operasyon dosyası içermez.
      </div>
      <AdminTable headers={["Görev", "Tarih", "Bölge", "Kesim/Dağıtım", "Hisse durumu", "Durum", "Notlar"]} recordCount={tasks.length} empty={!tasks.length}>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td className="font-bold text-dark-navy">{task.operationNo}</td>
            <td>{formatDate(task.plannedSlaughterDate)}</td>
            <td>{task.country} · {task.cityOrRegion}</td>
            <td>{task.slaughterLocation}<span className="block text-xs text-ink-muted">{task.distributionArea}</span></td>
            <td><QurbanProgress completed={task.completedShares} total={task.totalShares} /></td>
            <td><QurbanStatusCell status={task.statusLabel} /></td>
            <td>{task.notes}</td>
          </tr>
        ))}
      </AdminTable>
      <section className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
        <h2 className="text-xl font-extrabold text-dark-navy">Rapor girilecek alan demo</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold text-dark-navy">Kısa saha notu<textarea rows={4} disabled className="focus-ring mt-2 w-full rounded-2xl border border-border-soft bg-soft-gray px-4 py-3" placeholder="Demo not alanı" /></label>
          <label className="text-sm font-bold text-dark-navy">Dağıtım özeti<textarea rows={4} disabled className="focus-ring mt-2 w-full rounded-2xl border border-border-soft bg-soft-gray px-4 py-3" placeholder="Gerçek kayıt oluşturmaz" /></label>
        </div>
        <button type="button" disabled className="focus-ring mt-5 cursor-not-allowed rounded-md bg-ink-muted px-4 py-2 text-sm font-extrabold text-white">
          Rapor Kaydı Kapalı
        </button>
      </section>
    </div>
  );
}
