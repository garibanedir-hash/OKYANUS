import { reports } from "@/data/reports";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminReportsHubPage() {
  return (
    <div className="grid gap-5">
      <AdminSectionHeader eyebrow="Raporlama" title="Raporlar" description="Faaliyet raporu, operasyon raporu ve finansal özetlerin demo yönetim merkezi." actionLabel="Rapor Oluştur" />
      <AdminTable headers={["Rapor", "Dönem", "Kategori", "Durum", "Metrikler"]} recordCount={reports.length}>
        {reports.map((report) => (
          <tr key={report.id}>
            <td className="font-bold text-dark-navy">{report.title}</td>
            <td>{report.period}</td>
            <td>{report.category}</td>
            <td><AdminStatusBadge status={report.statusLabel} /></td>
            <td>{report.metrics.map((metric) => `${metric.label}: ${metric.value}`).join(", ")}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
