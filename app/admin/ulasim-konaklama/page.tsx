import { transportRows } from "@/data/adminOperationsMock";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminTransportPage() {
  return (
    <div className="grid gap-5">
      <AdminSectionHeader eyebrow="Operasyon" title="Ulaşım & Konaklama" description="Görev bazlı rota, ulaşım tipi ve konaklama planlama ekranı." actionLabel="Yeni Plan" />
      <AdminFilterBar showActions>
        <label>Görev<input className="focus-ring mt-1 w-full border px-3" placeholder="Görev ara" /></label>
        <label>Kişi<input className="focus-ring mt-1 w-full border px-3" placeholder="Personel" /></label>
        <label>Durum<select className="focus-ring mt-1 w-full border px-3"><option>Tümü</option><option>Planlandı</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Görev", "Kişi", "Rota", "Tarih", "Araç / Ulaşım", "Konaklama", "Durum"]} recordCount={transportRows.length}>
        {transportRows.map((row) => (
          <tr key={`${row.task}-${row.person}`}>
            <td className="font-bold text-dark-navy">{row.task}</td>
            <td>{row.person}</td>
            <td>{row.route}</td>
            <td>{row.date}</td>
            <td>{row.type}</td>
            <td>{row.stay}</td>
            <td><AdminStatusBadge status={row.status} /></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
