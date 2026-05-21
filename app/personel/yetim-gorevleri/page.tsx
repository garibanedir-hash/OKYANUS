import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getStaffOrphanAssignments } from "@/lib/data/orphanSponsorshipRepository";
import { formatDate } from "@/lib/format";
import { PrivacyNotice, SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

export default async function StaffOrphanTasksPage() {
  const tasks = await getStaffOrphanAssignments("demo-staff-account");

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Personel Paneli"
        title="Yetim Görevleri"
        description="Size atanan yetim/sponsorluk görevleri demo/read-only olarak listelenir. Güncelleme ve rapor kayıtları bu aşamada gerçek veri oluşturmaz."
      />
      <PrivacyNotice />
      <AdminTable headers={["Görev", "Yetim kodu", "Sponsorluk", "Son tarih", "Durum", "Mahremiyet notu"]} recordCount={tasks.length} empty={!tasks.length}>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td className="font-bold text-dark-navy">{task.assignmentType}</td>
            <td>{task.orphanCode}</td>
            <td>{task.sponsorshipNo ?? "-"}</td>
            <td>{task.dueDate ? formatDate(task.dueDate) : "-"}</td>
            <td><SponsorshipStatusCell status={task.statusLabel} /></td>
            <td>{task.notes}</td>
          </tr>
        ))}
      </AdminTable>
      <section className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
        <h2 className="text-xl font-extrabold text-dark-navy">Güncelleme hazırlama alanı demo</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold text-dark-navy">Güvenli güncelleme özeti<textarea rows={4} disabled className="focus-ring mt-2 w-full rounded-2xl border border-border-soft bg-soft-gray px-4 py-3" placeholder="Açık adres, okul adı veya aile detayı yazmayın" /></label>
          <label className="text-sm font-bold text-dark-navy">Rapor notu<textarea rows={4} disabled className="focus-ring mt-2 w-full rounded-2xl border border-border-soft bg-soft-gray px-4 py-3" placeholder="Gerçek kayıt oluşturmaz" /></label>
        </div>
        <button type="button" disabled className="focus-ring mt-5 cursor-not-allowed rounded-md bg-ink-muted px-4 py-2 text-sm font-extrabold text-white">
          Rapor Kaydı Kapalı
        </button>
      </section>
    </div>
  );
}
