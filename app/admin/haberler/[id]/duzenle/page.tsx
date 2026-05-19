import { notFound } from "next/navigation";
import { AdminFormShell } from "@/components/admin/AdminFormShell";
import { NewsForm } from "@/app/admin/haberler/NewsForm";
import { getNewsForEdit, updateNewsAction } from "@/app/admin/haberler/actions";

export const dynamic = "force-dynamic";

const statusMessages: Record<string, string> = {
  hata: "Haber güncellenemedi. Lütfen alanları kontrol edin.",
  yetkisiz: "Bu işlem için yetkili admin hesabınızla giriş yapmanız gerekiyor."
};

export default async function EditNewsPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const news = await getNewsForEdit(id);

  if (!news) {
    notFound();
  }

  const statusMessage = query?.mesaj ?? (query?.durum ? statusMessages[query.durum] : null);

  return (
    <AdminFormShell
      eyebrow="İçerik Yönetimi"
      title="Haberi Düzenle"
      description="Haber içeriğini güncelleyin, yayına alın veya arşivleyin."
      statusMessage={statusMessage}
      aside={
        <>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Kayıt</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{news.title}</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Arşivleme</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">Silme yoktur; durum alanını Arşiv olarak güncelleyin.</p>
          </div>
        </>
      }
    >
      <NewsForm action={updateNewsAction} news={news} submitLabel="Haberi Güncelle" />
    </AdminFormShell>
  );
}
