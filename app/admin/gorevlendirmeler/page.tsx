import { assignmentRows } from "@/data/adminOperationsMock";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminAssignmentsPage() {
  return (
    <div className="grid gap-5">
      <AdminSectionHeader eyebrow="Operasyon" title="Görevlendirmeler" description="Saha, finans, raporlama ve gönüllü operasyonları için görevlendirme takip listesi." actionLabel="Yeni Görevlendirme" />
      <AdminFilterBar showActions>
        <label>ID<input className="focus-ring mt-1 w-full border px-3" placeholder="47884" /></label>
        <label>Birim<select className="focus-ring mt-1 w-full border px-3"><option>Tümü</option><option>Saha Operasyon</option></select></label>
        <label>Görev konusu<input className="focus-ring mt-1 w-full border px-3" placeholder="Konu ara" /></label>
        <label>Sorumlu<input className="focus-ring mt-1 w-full border px-3" placeholder="Sorumlu" /></label>
        <label>Durum<select className="focus-ring mt-1 w-full border px-3"><option>Tümü</option><option>Devam Ediyor</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["İşlem", "Görev Konusu", "Sorumlu", "Görev Tarihi", "Kapatma Hedefi", "Kapanış Tarihi", "İdari Avans", "Proje Avansı", "Durum/Aşama", "Harcama", "Kalan"]} recordCount={assignmentRows.length}>
        {assignmentRows.map((row) => (
          <tr key={row.id}>
            <td><AdminActionButton href={`/admin/gorevlendirmeler/${row.id}`}>İncele</AdminActionButton></td>
            <td className="font-bold text-dark-navy">{row.subject}</td>
            <td>{row.responsible}</td>
            <td>{row.taskDate}</td>
            <td>{row.closeTarget}</td>
            <td>{row.closedAt}</td>
            <td>{row.adminAdvance}</td>
            <td>{row.projectAdvance}</td>
            <td><AdminStatusBadge status={row.stage} /></td>
            <td>{row.expense}</td>
            <td>{row.remaining}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
