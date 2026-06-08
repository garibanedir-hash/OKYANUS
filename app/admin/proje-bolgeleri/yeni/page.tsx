import { AdminFormShell } from "@/components/admin/AdminFormShell";
import { ProjectRegionForm } from "@/app/admin/proje-bolgeleri/ProjectRegionForm";
import { createProjectRegionAction } from "@/app/admin/proje-bolgeleri/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const statusMessages: Record<string, string> = {
  hata: "Proje bölgesi kaydedilemedi. Lütfen alanları kontrol edin.",
  yetkisiz: "Bu işlem için yetkili admin hesabınızla giriş yapmanız gerekiyor."
};

export default async function NewProjectRegionPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const params = await searchParams;
  const statusMessage = params?.mesaj ?? (params?.durum ? statusMessages[params.durum] : null);

  return (
    <AdminFormShell
      eyebrow="İçerik Yönetimi"
      title="Yeni Proje Bölgesi"
      description="Public proje haritasında kullanılacak çalışma bölgesi kaydını oluşturun."
      statusMessage={statusMessage}
      aside={
        <>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Public görünürlük</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">Aktif ve public bölgeler haritada görünür. İç kayıt bölgeleri admin panelde saklanır.</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Harita konumu</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">Ülke ve şehir/bölge seçimi harita işaretinin konumunu otomatik belirler.</p>
          </div>
        </>
      }
    >
      <ProjectRegionForm action={createProjectRegionAction} submitLabel="Bölgeyi Kaydet" />
    </AdminFormShell>
  );
}
