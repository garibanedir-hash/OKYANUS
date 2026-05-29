import { notFound } from "next/navigation";
import { AdminFormShell } from "@/components/admin/AdminFormShell";
import { ProjectActivityForm } from "@/components/admin/project-activities/ProjectActivityForm";
import { getProjectActivityProjectSummary } from "@/lib/data/projectActivityRepository";
import { createProjectActivityAction } from "@/app/admin/projeler/[id]/faaliyetler/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const statusMessages: Record<string, string> = {
  hata: "Faaliyet oluşturulamadı. Lütfen alanları kontrol edin.",
  yetkisiz: "Bu işlem için yetkili admin hesabıyla giriş yapmanız gerekiyor."
};

export default async function NewProjectActivityPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const project = await getProjectActivityProjectSummary(id);
  if (!project) notFound();

  const statusMessage = query?.mesaj ?? (query?.durum ? statusMessages[query.durum] : null);

  return (
    <AdminFormShell
      eyebrow="Proje Operasyonları"
      title="Yeni Faaliyet Kaydı"
      description={`${project.title} projesi için saha, dağıtım, ekip, lokasyon ve public görünürlük bilgilerini kaydedin.`}
      statusMessage={statusMessage}
      aside={
        <>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Proje</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{project.title}</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Public yayın kuralı</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">Public görünürlük yalnızca tamamlanan faaliyetlerde kullanılmalıdır. İç notlar public sayfaya taşınmaz.</p>
          </div>
        </>
      }
    >
      <ProjectActivityForm
        action={createProjectActivityAction}
        projectId={id}
        submitLabel="Faaliyeti Kaydet"
        cancelHref={`/admin/projeler/${id}/faaliyetler`}
      />
    </AdminFormShell>
  );
}
