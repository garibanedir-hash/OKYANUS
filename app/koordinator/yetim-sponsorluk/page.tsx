import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getCoordinatorOrphanAssignments } from "@/lib/data/orphanSponsorshipRepository";
import { formatDate } from "@/lib/format";
import { PrivacyNotice, SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

export default async function CoordinatorOrphanSponsorshipPage() {
  const assignments = await getCoordinatorOrphanAssignments("demo-coordinator-account");
  const updatePending = assignments.filter((item) => ["assigned", "in_progress"].includes(item.status)).length;

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Koordinatör Paneli"
        title="Yetim Sponsorluk Takibi"
        description="Sorumlu olduğunuz yetim/sponsorluk kayıtları, güncelleme bekleyenler ve personel görevleri demo/read-only olarak gösterilir."
      />
      <PrivacyNotice />
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase text-ink-muted">Sorumlu görev</p>
          <p className="mt-2 text-3xl font-black text-deep-blue">{assignments.length}</p>
        </div>
        <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase text-ink-muted">Güncelleme bekleyen</p>
          <p className="mt-2 text-3xl font-black text-deep-blue">{updatePending}</p>
        </div>
        <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase text-ink-muted">Mahremiyet kontrolü</p>
          <p className="mt-2 text-lg font-black text-dark-navy">Zorunlu</p>
        </div>
      </section>
      <AdminTable headers={["Görev", "Yetim kodu", "Sponsorluk", "Bölge/ülke takibi", "Sorumlu", "Durum", "Son tarih", "Not"]} recordCount={assignments.length} empty={!assignments.length}>
        {assignments.map((assignment) => (
          <tr key={assignment.id}>
            <td className="font-bold text-dark-navy">{assignment.assignmentType}</td>
            <td>{assignment.orphanCode}</td>
            <td>{assignment.sponsorshipNo ?? "-"}</td>
            <td>Güvenli bölge özeti</td>
            <td>{assignment.assignedToName}</td>
            <td><SponsorshipStatusCell status={assignment.statusLabel} /></td>
            <td>{assignment.dueDate ? formatDate(assignment.dueDate) : "-"}</td>
            <td>{assignment.notes}</td>
          </tr>
        ))}
      </AdminTable>
      <section className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
        <h2 className="text-xl font-extrabold text-dark-navy">Koordinasyon notları</h2>
        <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm font-semibold leading-6 text-ink-muted">
          <li>Sponsorluk eşleşmeleri çocuk mahremiyeti ve saha değerlendirmesiyle yapılır.</li>
          <li>Personel güncellemeleri yayınlanmadan önce mahremiyet kontrolünden geçmelidir.</li>
          <li>Fotoğraf/PDF upload ve gerçek bildirim gönderimi sonraki aşamada ayrıca korunacaktır.</li>
        </ul>
      </section>
    </div>
  );
}
