import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminOrphanAssignments } from "@/lib/data/orphanSponsorshipRepository";
import { formatDate } from "@/lib/format";
import { PrivacyNotice, SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

export default async function AdminOrphanAssignmentsPage() {
  const assignments = await getAdminOrphanAssignments();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Yetim Hamiliği"
        title="Görevler"
        description="Koordinatör ve personel görevleri read-only listelenir. Rapor ve güncelleme yazımı sonraki aşamada yetki kontrolüyle açılacaktır."
      />
      <PrivacyNotice />
      <AdminFilterBar>
        <label>Görev<input disabled placeholder="Filtre" /></label>
        <label>Sorumlu<input disabled placeholder="Filtre" /></label>
        <label>Durum<select disabled><option>Tümü</option><option>Atandı</option><option>Devam ediyor</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Görev", "Yetim kodu", "Sponsorluk", "Sorumlu", "Durum", "Son tarih", "İşlem"]} recordCount={assignments.length} empty={!assignments.length}>
        {assignments.map((assignment) => (
          <tr key={assignment.id}>
            <td className="font-bold text-dark-navy">{assignment.assignmentType}</td>
            <td>{assignment.orphanCode}</td>
            <td>{assignment.sponsorshipNo ?? "-"}</td>
            <td>{assignment.assignedToName}</td>
            <td><SponsorshipStatusCell status={assignment.statusLabel} /></td>
            <td>{assignment.dueDate ? formatDate(assignment.dueDate) : "-"}</td>
            <td><AdminActionButton>Görev</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
