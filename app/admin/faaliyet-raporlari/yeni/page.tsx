import { AdminFormShell } from "@/components/admin/AdminFormShell";
import { ReportForm } from "@/app/admin/faaliyet-raporlari/ReportForm";
import { createReportAction } from "@/app/admin/faaliyet-raporlari/actions";

const statusMessages: Record<string, string> = {
  hata: "Rapor kaydedilemedi. Lütfen alanları kontrol edin.",
  yetkisiz: "Bu işlem için yetkili admin hesabınızla giriş yapmanız gerekiyor."
};

export default async function NewReportPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const params = await searchParams;
  const statusMessage = params?.mesaj ?? (params?.durum ? statusMessages[params.durum] : null);

  return (
    <AdminFormShell
      eyebrow="Şeffaflık Yönetimi"
      title="Yeni Faaliyet Raporu"
      description="Faaliyet raporlarını public reports tablosuna kontrollü şekilde ekleyin. Dosya upload bu aşamada yoktur."
      statusMessage={statusMessage}
      aside={
        <>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">PDF Durumu</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">PDF URL boş bırakılabilir. Upload ve private bucket akışı sonraki aşamaya ayrıldı.</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Yayın</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">Published olmayan raporlar public arşivde görünmez.</p>
          </div>
        </>
      }
    >
      <ReportForm action={createReportAction} submitLabel="Raporu Kaydet" />
    </AdminFormShell>
  );
}
