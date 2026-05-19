import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getCoordinatorQurbanOperations } from "@/lib/data/qurbanRepository";
import { formatDate } from "@/lib/format";
import { QurbanProgress, QurbanStatusCell } from "@/app/admin/kurban/_components/QurbanAdminShared";

export default async function CoordinatorQurbanOperationPage() {
  const operations = await getCoordinatorQurbanOperations("demo-coordinator-account");

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Koordinatör Paneli"
        title="Kurban Operasyonları"
        description="Sorumlu olduğunuz kurban operasyonlarının kesim planı, ekip ataması, hisse/adet durumu ve dağıtım takibi demo/read-only olarak gösterilir."
      />
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase text-ink-muted">Sorumlu operasyon</p>
          <p className="mt-2 text-3xl font-black text-deep-blue">{operations.length}</p>
        </div>
        <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase text-ink-muted">Toplam hisse</p>
          <p className="mt-2 text-3xl font-black text-deep-blue">{operations.reduce((sum, operation) => sum + operation.totalShares, 0)}</p>
        </div>
        <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase text-ink-muted">Rapor bekleyen işler</p>
          <p className="mt-2 text-3xl font-black text-deep-blue">{operations.filter((operation) => operation.status === "slaughter_completed").length}</p>
        </div>
      </section>
      <AdminTable headers={["Operasyon No", "Bölge/ülke", "Kesim planı", "Sorumlu personel", "Tamamlanan/bekleyen hisse", "Dağıtım durumu", "Rapor", "Durum"]} recordCount={operations.length} empty={!operations.length}>
        {operations.map((operation) => (
          <tr key={operation.id}>
            <td className="font-bold text-dark-navy">{operation.operationNo}</td>
            <td>{operation.country} · {operation.cityOrRegion}</td>
            <td>{formatDate(operation.plannedSlaughterDate)}</td>
            <td>{operation.responsibleStaffName}</td>
            <td><QurbanProgress completed={operation.completedShares} total={operation.totalShares} /></td>
            <td>{operation.distributionArea}</td>
            <td>{operation.status === "slaughter_completed" ? "Rapor bekliyor" : "Takipte"}</td>
            <td><QurbanStatusCell status={operation.statusLabel} /></td>
          </tr>
        ))}
      </AdminTable>
      <section className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
        <h2 className="text-xl font-extrabold text-dark-navy">Koordinasyon notları</h2>
        <ul className="mt-4 grid gap-2 text-sm font-semibold leading-6 text-ink-muted">
          <li>- Kesim listesi ödeme ve vekalet onayları netleşmeden kilitlenmez.</li>
          <li>- Personel rapor alanı bu aşamada demo olarak tutulur.</li>
          <li>- Gerçek saha verisi ve fotoğraf/PDF upload sonraki aşamada ayrıca korunacaktır.</li>
        </ul>
      </section>
    </div>
  );
}
