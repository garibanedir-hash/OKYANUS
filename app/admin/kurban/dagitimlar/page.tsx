import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { mockQurbanDistributionLogs } from "@/data/qurbanMock";
import { formatDate } from "@/lib/format";
import { QurbanStatusCell } from "@/app/admin/kurban/_components/QurbanAdminShared";

export default function AdminQurbanDistributionsPage() {
  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Kurban Çalışmaları"
        title="Dağıtımlar"
        description="Dağıtım kayıtları demo/read-only olarak listelenir. Dosya, fotoğraf veya PDF upload bu aşamada yoktur."
      />
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">Kayıt yok</div>
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Operasyon<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="OP-KRB..." /></label>
        <label className="text-sm font-bold text-dark-navy">Bölge<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="Bölge ara" /></label>
        <label className="text-sm font-bold text-dark-navy">Tarih<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Bu hafta</option><option>Bu ay</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Operasyon", "Dağıtım tarihi", "Bölge", "Aile sayısı", "Paket sayısı", "Yararlanıcı grup", "Not", "Durum", "İşlem"]} recordCount={mockQurbanDistributionLogs.length} empty={!mockQurbanDistributionLogs.length}>
        {mockQurbanDistributionLogs.map((log) => (
          <tr key={log.id}>
            <td className="font-bold text-dark-navy">{log.operationNo}</td>
            <td>{formatDate(log.distributionDate)}</td>
            <td>{log.location}</td>
            <td>{log.familyCount}</td>
            <td>{log.packageCount}</td>
            <td>{log.beneficiaryGroup}</td>
            <td>{log.notes}</td>
            <td><QurbanStatusCell status={log.statusLabel} /></td>
            <td><AdminActionButton>Dağıtım</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
