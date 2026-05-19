import { notFound } from "next/navigation";
import { AdminFormShell } from "@/components/admin/AdminFormShell";
import { ReportForm } from "@/app/admin/faaliyet-raporlari/ReportForm";
import { getReportForEdit, updateReportAction } from "@/app/admin/faaliyet-raporlari/actions";

export const dynamic = "force-dynamic";

const statusMessages: Record<string, string> = {
  hata: "Rapor güncellenemedi. Lütfen alanları kontrol edin.",
  yetkisiz: "Bu işlem için yetkili admin hesabınızla giriş yapmanız gerekiyor."
};

export default async function EditReportPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const report = await getReportForEdit(id);

  if (!report) {
    notFound();
  }

  const statusMessage = query?.mesaj ?? (query?.durum ? statusMessages[query.durum] : null);

  return (
    <AdminFormShell
      eyebrow="Şeffaflık Yönetimi"
      title="Faaliyet Raporunu Düzenle"
      description="Rapor özetini, metriklerini ve yayın durumunu güncelleyin."
      statusMessage={statusMessage}
      aside={
        <>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Kayıt</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{report.title}</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Arşivleme</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">Hard delete yoktur; durum alanını Arşiv olarak güncelleyin.</p>
          </div>
        </>
      }
    >
      <ReportForm action={updateReportAction} report={report} submitLabel="Raporu Güncelle" />
    </AdminFormShell>
  );
}
