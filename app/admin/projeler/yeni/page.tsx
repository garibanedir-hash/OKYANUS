import { AdminFormShell } from "@/components/admin/AdminFormShell";
import { ProjectForm } from "@/app/admin/projeler/ProjectForm";
import { createProjectAction } from "@/app/admin/projeler/actions";
import { getAdminProjectRegions } from "@/lib/data/projectRegionRepository";

const statusMessages: Record<string, string> = {
  hata: "Proje kaydedilemedi. Lütfen alanları kontrol edin.",
  yetkisiz: "Bu işlem için yetkili admin hesabınızla giriş yapmanız gerekiyor."
};

export default async function NewProjectPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const params = await searchParams;
  const statusMessage = params?.mesaj ?? (params?.durum ? statusMessages[params.durum] : null);
  const { data: regions } = await getAdminProjectRegions();
  const regionOptions = regions
    .filter((region) => region.is_active)
    .map((region) => ({
      label: `${region.name}${region.country ? ` · ${region.country}` : ""}`,
      value: region.slug,
      country: region.country,
      city: region.name,
      regionLabel: region.region_label
    }));

  return (
    <AdminFormShell
      eyebrow="İçerik Yönetimi"
      title="Yeni Proje"
      description="Public projeler tablosuna kontrollü, server-side ve RLS uyumlu yeni proje kaydı oluşturun."
      statusMessage={statusMessage}
      aside={
        <>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Yayın Notu</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">Taslak kayıtlar public sitede görünmez. Yayın için durum alanını Yayında seçin.</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Güvenlik</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">İşlem server action üzerinden admin rolü doğrulanarak yapılır. Hard delete yoktur.</p>
          </div>
        </>
      }
    >
      <ProjectForm action={createProjectAction} regionOptions={regionOptions} submitLabel="Projeyi Kaydet" />
    </AdminFormShell>
  );
}
