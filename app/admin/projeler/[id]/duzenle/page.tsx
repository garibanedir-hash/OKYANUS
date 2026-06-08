import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminFormShell } from "@/components/admin/AdminFormShell";
import { ProjectForm } from "@/app/admin/projeler/ProjectForm";
import { getProjectForEdit, updateProjectAction } from "@/app/admin/projeler/actions";
import { getAdminProjectRegions } from "@/lib/data/projectRegionRepository";

export const dynamic = "force-dynamic";

const statusMessages: Record<string, string> = {
  hata: "Proje güncellenemedi. Lütfen alanları kontrol edin.",
  yetkisiz: "Bu işlem için yetkili admin hesabınızla giriş yapmanız gerekiyor."
};

export default async function EditProjectPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [project, regionsResult] = await Promise.all([
    getProjectForEdit(id),
    getAdminProjectRegions()
  ]);

  if (!project) {
    notFound();
  }

  const statusMessage = query?.mesaj ?? (query?.durum ? statusMessages[query.durum] : null);
  const regionOptions = regionsResult.data
    .filter((region) => region.is_active || region.slug === project.regionSlug)
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
      title="Projeyi Düzenle"
      description="Proje içeriğini güncelleyin, yayına alın veya arşiv durumuna taşıyın."
      statusMessage={statusMessage}
      aside={
        <>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Kayıt</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{project.title}</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Arşivleme</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">Silme işlemi yerine durum alanını Arşiv olarak güncelleyin.</p>
          </div>
          <Link href={`/admin/projeler/${id}/faaliyetler`} className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-extrabold text-deep-blue ring-1 ring-border-soft hover:bg-soft-blue">
            Bu Projenin Faaliyetleri
          </Link>
        </>
      }
    >
      <ProjectForm action={updateProjectAction} project={project} regionOptions={regionOptions} submitLabel="Projeyi Güncelle" />
    </AdminFormShell>
  );
}
