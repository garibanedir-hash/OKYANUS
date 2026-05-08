import { reports } from "@/data/reports";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminReportsPage() {
  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Şeffaflık Yönetimi"
        title="Faaliyet Raporları"
        description="Raporlar şeffaflık sayfasıyla ilişkilidir. PDF yükleme alanı ileride gerçek dosya yönetimine bağlanacaktır."
        actionLabel="Yeni Rapor Ekle"
      />
      <div className="rounded-brand border border-border-soft bg-soft-blue p-4 text-sm font-bold leading-6 text-deep-blue">
        PDF yükleme alanı ileride eklenecek. Bu ekran şeffaflık sayfasında yayınlanacak raporların demo yönetimidir.
      </div>
      <AdminTable headers={["Rapor adı", "Dönem", "Kategori", "Durum", "PDF durumu", "Öne çıkan metrikler", "İşlemler"]}>
        {reports.map((report) => (
          <tr key={report.id}>
            <td className="px-4 py-3 font-bold text-dark-navy">{report.title}</td>
            <td className="px-4 py-3 text-ink-muted">{report.period}</td>
            <td className="px-4 py-3 text-ink-muted">{report.category}</td>
            <td className="px-4 py-3"><AdminStatusBadge status="Yayında" /></td>
            <td className="px-4 py-3"><AdminStatusBadge status={report.statusLabel} /></td>
            <td className="px-4 py-3 text-ink-muted">{report.metrics.map((metric) => `${metric.label}: ${metric.value}`).join(", ")}</td>
            <td className="px-4 py-3"><div className="flex gap-2"><AdminActionButton href="/faaliyet-raporlari">İncele</AdminActionButton><AdminActionButton>Düzenle</AdminActionButton></div></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
