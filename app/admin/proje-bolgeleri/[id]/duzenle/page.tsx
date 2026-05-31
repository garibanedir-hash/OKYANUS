import { notFound } from "next/navigation";
import { AdminFormShell } from "@/components/admin/AdminFormShell";
import { ProjectRegionForm } from "@/app/admin/proje-bolgeleri/ProjectRegionForm";
import { updateProjectRegionAction } from "@/app/admin/proje-bolgeleri/actions";
import { getAdminProjectRegionById } from "@/lib/data/projectRegionRepository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const statusMessages: Record<string, string> = {
  hata: "Proje bölgesi güncellenemedi. Lütfen alanları kontrol edin.",
  yetkisiz: "Bu işlem için yetkili admin hesabınızla giriş yapmanız gerekiyor."
};

export default async function EditProjectRegionPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { data: region } = await getAdminProjectRegionById(id);

  if (!region) {
    notFound();
  }

  const statusMessage = query?.mesaj ?? (query?.durum ? statusMessages[query.durum] : null);

  return (
    <AdminFormShell
      eyebrow="İçerik Yönetimi"
      title="Proje Bölgesini Düzenle"
      description="Çalışma bölgesinin harita bilgilerini, public görünürlüğünü ve yedek proje/faaliyet eşleşmelerini güncelleyin."
      statusMessage={statusMessage}
      aside={
        <>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Kayıt</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{region.name}</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Bağlı Proje</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{region.linkedProjectCount} proje doğrudan bu slug ile bağlı.</p>
          </div>
        </>
      }
    >
      <ProjectRegionForm action={updateProjectRegionAction} region={region} submitLabel="Bölgeyi Güncelle" />
    </AdminFormShell>
  );
}
