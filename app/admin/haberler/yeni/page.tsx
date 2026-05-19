import { AdminFormShell } from "@/components/admin/AdminFormShell";
import { NewsForm } from "@/app/admin/haberler/NewsForm";
import { createNewsAction } from "@/app/admin/haberler/actions";

const statusMessages: Record<string, string> = {
  hata: "Haber kaydedilemedi. Lütfen alanları kontrol edin.",
  yetkisiz: "Bu işlem için yetkili admin hesabınızla giriş yapmanız gerekiyor."
};

export default async function NewNewsPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const params = await searchParams;
  const statusMessage = params?.mesaj ?? (params?.durum ? statusMessages[params.durum] : null);

  return (
    <AdminFormShell
      eyebrow="İçerik Yönetimi"
      title="Yeni Haber"
      description="Haber ve duyuruları server-side doğrulama ile oluşturun. Yayın durumu published olana kadar public sitede görünmez."
      statusMessage={statusMessage}
      aside={
        <>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Yayın Ayarı</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">Published seçildiğinde başlık, slug ve içerik dolu olmalıdır.</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Editör</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">Bu aşamada rich editor yok; içerik güvenli textarea ile alınır.</p>
          </div>
        </>
      }
    >
      <NewsForm action={createNewsAction} submitLabel="Haberi Kaydet" />
    </AdminFormShell>
  );
}
