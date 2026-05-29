import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFormShell } from "@/components/admin/AdminFormShell";
import { ProjectActivityForm } from "@/components/admin/project-activities/ProjectActivityForm";
import {
  getProjectActivityById,
  getProjectActivityProjectSummary
} from "@/lib/data/projectActivityRepository";
import { updateProjectActivityAction } from "@/app/admin/projeler/[id]/faaliyetler/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const statusMessages: Record<string, string> = {
  hata: "Faaliyet güncellenemedi. Lütfen alanları kontrol edin.",
  yetkisiz: "Bu işlem için yetkili admin hesabıyla giriş yapmanız gerekiyor."
};

export default async function EditProjectActivityPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string; activityId: string }>;
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const [{ id, activityId }, query] = await Promise.all([params, searchParams]);
  const [project, activityResult] = await Promise.all([
    getProjectActivityProjectSummary(id),
    getProjectActivityById(activityId)
  ]);

  if (!project || !activityResult.data || activityResult.data.projectId !== id) notFound();

  const activity = activityResult.data;
  const locked = activity.status === "cancelled" || activity.status === "archived";
  const statusMessage = query?.mesaj ?? (query?.durum ? statusMessages[query.durum] : null);

  return (
    <AdminFormShell
      eyebrow="Proje Operasyonları"
      title="Faaliyeti Düzenle"
      description={`${project.title} projesine bağlı faaliyet kaydını güncelleyin. Public görünürlük için faaliyet Tamamlandı durumunda olmalıdır.`}
      statusMessage={statusMessage}
      aside={
        <>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Kayıt</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{activity.title}</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-dark-navy">Veri kaynağı</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{activityResult.source === "supabase" ? "Supabase" : "Demo fallback"}</p>
          </div>
          <Link href={`/admin/projeler/${id}/faaliyetler/${activity.id}`} className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-extrabold text-deep-blue ring-1 ring-border-soft hover:bg-soft-blue">
            Detaya Dön
          </Link>
        </>
      }
    >
      {locked || activityResult.source === "demo" ? (
        <div className="rounded-lg border border-warm-accent/25 bg-warm-accent/10 px-4 py-3 text-sm font-bold leading-6 text-dark-navy">
          {activityResult.source === "demo"
            ? "Demo kayıtlarda düzenleme kapalıdır. Supabase kaydı gerekir."
            : "İptal edilmiş veya arşivlenmiş faaliyet düzenlenemez."}
        </div>
      ) : (
        <ProjectActivityForm
          action={updateProjectActivityAction}
          projectId={id}
          activity={activity}
          submitLabel="Faaliyeti Güncelle"
          cancelHref={`/admin/projeler/${id}/faaliyetler/${activity.id}`}
        />
      )}
    </AdminFormShell>
  );
}
