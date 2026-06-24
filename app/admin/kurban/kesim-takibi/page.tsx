import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminQurbanOperationsWithSource } from "@/lib/data/qurbanRepository";
import { formatDate } from "@/lib/format";
import { QurbanDataSourceBadge, QurbanProgress, QurbanStatusCell } from "@/app/admin/kurban/_components/QurbanAdminShared";

export default async function AdminQurbanSlaughterTrackingPage() {
  const { data: operations, source } = await getAdminQurbanOperationsWithSource();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Kurban Çalışmaları"
        title="Kesim Takibi"
        description="Operasyon bazlı kesim planları, sorumlu ekipler ve tamamlanan hisse/adet durumu read-only izlenir."
      />
      <QurbanDataSourceBadge source={source} />
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Operasyon No<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="OP-KRB..." /></label>
        <label className="text-sm font-bold text-dark-navy">Ülke/Bölge<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Türkiye</option><option>Afrika Bölgesi</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Durum<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Planlama</option><option>Atandı</option><option>Kesim tamamlandı</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Operasyon No", "Ülke/Bölge", "Kampanya", "Planlanan kesim", "Sorumlu koordinatör", "Sorumlu personel", "Toplam/Tamamlanan", "Durum", "İşlem"]} recordCount={operations.length} empty={!operations.length}>
        {operations.map((operation) => (
          <tr key={operation.id}>
            <td className="font-bold text-dark-navy">{operation.operationNo}</td>
            <td>{operation.country} · {operation.cityOrRegion}</td>
            <td>{operation.campaignTitle}</td>
            <td>{formatDate(operation.plannedSlaughterDate)}</td>
            <td>{operation.responsibleCoordinatorName}</td>
            <td>{operation.responsibleStaffName}</td>
            <td><QurbanProgress completed={operation.completedShares} total={operation.totalShares} /></td>
            <td><QurbanStatusCell status={operation.statusLabel} /></td>
            <td><AdminActionButton>Operasyon</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
