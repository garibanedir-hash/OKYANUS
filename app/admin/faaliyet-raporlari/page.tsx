import { getPublishedReportsWithSource } from "@/lib/data/reportsRepository";
import { archiveReportAction } from "@/app/admin/faaliyet-raporlari/actions";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

const statusMessages: Record<string, string> = {
  "rapor-olusturuldu": "Rapor kaydı oluşturuldu.",
  "rapor-guncellendi": "Rapor kaydı güncellendi.",
  "rapor-arsivlendi": "Rapor arşivlendi.",
  hata: "İşlem tamamlanamadı. Lütfen tekrar deneyin.",
  yetkisiz: "Bu işlem için yetkili admin hesabınızla giriş yapmanız gerekiyor."
};

export default async function AdminReportsPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const params = await searchParams;
  const { data: reports, source } = await getPublishedReportsWithSource();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Şeffaflık Yönetimi"
        title="Faaliyet Raporları"
        description="Raporlar şeffaflık sayfasıyla ilişkilidir. PDF yükleme alanı ileride gerçek dosya yönetimine bağlanacaktır."
        actionLabel="Yeni Rapor Ekle"
        actionHref="/admin/faaliyet-raporlari/yeni"
      />
      {params?.durum ? (
        <div className="rounded-lg border border-primary-blue/20 bg-soft-blue px-4 py-3 text-sm font-bold leading-6 text-deep-blue">
          {params.mesaj ?? statusMessages[params.durum] ?? "İşlem tamamlandı."}
        </div>
      ) : null}
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
        Veri kaynağı: {source === "supabase" ? "Supabase read-only" : "Demo fallback"}
      </div>
      <div className="rounded-brand border border-border-soft bg-soft-blue p-4 text-sm font-bold leading-6 text-deep-blue">
        PDF yükleme alanı ileride eklenecek. Bu ekran şeffaflık sayfasında yayınlanacak raporların demo yönetimidir.
      </div>
      <AdminTable headers={["Rapor adı", "Dönem", "Kategori", "Durum", "PDF durumu", "Öne çıkan metrikler", "İşlemler"]} recordCount={reports.length} empty={!reports.length}>
        {reports.map((report) => (
          <tr key={report.id}>
            <td className="px-4 py-3 font-bold text-dark-navy">{report.title}</td>
            <td className="px-4 py-3 text-ink-muted">{report.period}</td>
            <td className="px-4 py-3 text-ink-muted">{report.category}</td>
            <td className="px-4 py-3"><AdminStatusBadge status="Yayında" /></td>
            <td className="px-4 py-3"><AdminStatusBadge status={report.statusLabel} /></td>
            <td className="px-4 py-3 text-ink-muted">{report.metrics.map((metric) => `${metric.label}: ${metric.value}`).join(", ")}</td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <AdminActionButton href="/faaliyet-raporlari">İncele</AdminActionButton>
                <AdminActionButton href={`/admin/faaliyet-raporlari/${report.id}/duzenle`}>Düzenle</AdminActionButton>
                <form action={archiveReportAction}>
                  <input type="hidden" name="id" value={report.id} />
                  <button type="submit" className="focus-ring inline-flex min-h-8 items-center justify-center rounded-md bg-warm-accent/15 px-2.5 py-1 text-[0.72rem] font-extrabold text-dark-navy ring-1 ring-warm-accent/25 transition hover:bg-warm-accent/25">
                    Arşivle
                  </button>
                </form>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
