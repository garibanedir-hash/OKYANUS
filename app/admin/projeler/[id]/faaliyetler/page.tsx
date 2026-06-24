import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { ProjectActivityStatusBadge, ProjectActivityVisibilityBadge } from "@/components/admin/project-activities/ProjectActivityBadges";
import { projectActivityStatusLabels, projectActivityTypeLabels, projectActivityVisibilityLabels } from "@/data/projectActivityMock";
import {
  getAdminProjectActivities,
  getProjectActivityProjectSummary
} from "@/lib/data/projectActivityRepository";
import {
  archiveProjectActivityAction,
  cancelProjectActivityAction,
  markProjectActivityCompletedAction,
  toggleProjectActivityVisibilityAction
} from "@/app/admin/projeler/[id]/faaliyetler/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const statusMessages: Record<string, string> = {
  "faaliyet-olusturuldu": "Faaliyet kaydı oluşturuldu.",
  "faaliyet-guncellendi": "Faaliyet kaydı güncellendi.",
  "durum-guncellendi": "Faaliyet durumu güncellendi.",
  "gorunurluk-guncellendi": "Faaliyet görünürlüğü güncellendi.",
  "iptal-edildi": "Faaliyet iptal edildi.",
  arsivlendi: "Faaliyet arşivlendi.",
  hata: "İşlem tamamlanamadı. Lütfen alanları kontrol edin.",
  yetkisiz: "Bu işlem için yetkili admin hesabıyla giriş yapmanız gerekiyor."
};

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function ActivityRowActions({
  projectId,
  activityId,
  source,
  status,
  visibility
}: {
  projectId: string;
  activityId: string;
  source: "supabase" | "demo";
  status: string;
  visibility: string;
}) {
  const isDemo = source === "demo";
  const isTerminal = status === "archived" || status === "cancelled";
  const canComplete = !isDemo && !isTerminal && status !== "completed";
  const canToggle = !isDemo && !isTerminal && (visibility === "public" || status === "completed");
  const canCancel = !isDemo && !isTerminal;
  const canArchive = !isDemo && status !== "archived";

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/admin/projeler/${projectId}/faaliyetler/${activityId}`} className="focus-ring inline-flex min-h-8 items-center rounded-md bg-white px-2.5 py-1 text-[0.72rem] font-extrabold text-deep-blue ring-1 ring-border-soft hover:bg-soft-blue">
        Detay
      </Link>
      <Link href={`/admin/projeler/${projectId}/faaliyetler/${activityId}/duzenle`} className="focus-ring inline-flex min-h-8 items-center rounded-md bg-white px-2.5 py-1 text-[0.72rem] font-extrabold text-deep-blue ring-1 ring-border-soft hover:bg-soft-blue">
        Düzenle
      </Link>
      {canComplete ? (
        <form action={markProjectActivityCompletedAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="activityId" value={activityId} />
          <button type="submit" className="focus-ring inline-flex min-h-8 items-center rounded-md bg-ocean-green px-2.5 py-1 text-[0.72rem] font-extrabold text-white">
            Tamamlandı
          </button>
        </form>
      ) : null}
      {canToggle ? (
        <form action={toggleProjectActivityVisibilityAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="activityId" value={activityId} />
          <button type="submit" className="focus-ring inline-flex min-h-8 items-center rounded-md bg-soft-blue px-2.5 py-1 text-[0.72rem] font-extrabold text-deep-blue">
            {visibility === "public" ? "İç Kayıt" : "Public Yap"}
          </button>
        </form>
      ) : null}
      {canCancel ? (
        <form action={cancelProjectActivityAction} className="flex gap-1">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="activityId" value={activityId} />
          <input name="reason" required placeholder="İptal gerekçesi" className="focus-ring w-28 rounded-md border border-border-soft px-2 py-1 text-[0.72rem]" />
          <button type="submit" className="focus-ring inline-flex min-h-8 items-center rounded-md bg-warm-accent/15 px-2.5 py-1 text-[0.72rem] font-extrabold text-dark-navy ring-1 ring-warm-accent/25">
            İptal
          </button>
        </form>
      ) : null}
      {canArchive ? (
        <form action={archiveProjectActivityAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="activityId" value={activityId} />
          <button type="submit" className="focus-ring inline-flex min-h-8 items-center rounded-md bg-white px-2.5 py-1 text-[0.72rem] font-extrabold text-ink-muted ring-1 ring-border-soft">
            Arşivle
          </button>
        </form>
      ) : null}
      {isDemo ? <span className="text-[0.7rem] font-bold text-ink-muted">Supabase kaydı gerekir</span> : null}
    </div>
  );
}

export default async function AdminProjectActivitiesPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ durum?: string; mesaj?: string; status?: string; visibility?: string; activityType?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const project = await getProjectActivityProjectSummary(id);
  if (!project) notFound();

  const { data: activities, source } = await getAdminProjectActivities({
    projectId: id,
    status: query?.status,
    visibility: query?.visibility,
    activityType: query?.activityType
  });

  const publicCount = activities.filter((activity) => activity.visibility === "public" && activity.status === "completed").length;
  const completedCount = activities.filter((activity) => activity.status === "completed").length;
  const lastActivity = activities[0]?.activityDate ?? activities[0]?.updatedAt;
  const statusMessage = query?.mesaj ?? (query?.durum ? statusMessages[query.durum] : null);

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Proje Operasyonları"
        title={`${project.title} faaliyetleri`}
        description="Proje altında saha ziyareti, dağıtım, raporlama ve operasyon kayıtlarını yönetin. Public görünür kayıtlar yalnızca tamamlanmış faaliyetlerden yayınlanır."
        actionLabel="Yeni Faaliyet Ekle"
        actionHref={`/admin/projeler/${id}/faaliyetler/yeni`}
      />
      {statusMessage ? (
        <div className="rounded-lg border border-primary-blue/20 bg-soft-blue px-4 py-3 text-sm font-bold leading-6 text-deep-blue">
          {statusMessage}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/projeler" className="text-sm font-bold text-deep-blue hover:underline">Projeler</Link>
        <span className="text-sm text-ink-muted">/</span>
        <Link href={`/admin/projeler/${id}/duzenle`} className="text-sm font-bold text-deep-blue hover:underline">Proje Düzenle</Link>
        <span className="rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
          {source === "supabase" ? "Gerçek kayıt" : "Kayıt yok"}
        </span>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMiniStat label="Toplam faaliyet" value={activities.length} />
        <AdminMiniStat label="Tamamlanan" value={completedCount} />
        <AdminMiniStat label="Public görünür" value={publicCount} />
        <AdminMiniStat label="Son faaliyet" value={formatDate(lastActivity)} />
      </section>
      <form>
        <AdminFilterBar>
          <label className="text-sm font-bold text-dark-navy">
            Tür
            <select name="activityType" defaultValue={query?.activityType ?? "all"} className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2">
              <option value="all">Tümü</option>
              {Object.entries(projectActivityTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-dark-navy">
            Durum
            <select name="status" defaultValue={query?.status ?? "all"} className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2">
              <option value="all">Tümü</option>
              {Object.entries(projectActivityStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-dark-navy">
            Görünürlük
            <select name="visibility" defaultValue={query?.visibility ?? "all"} className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2">
              <option value="all">Tümü</option>
              {Object.entries(projectActivityVisibilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <button type="submit" className="focus-ring self-end rounded-2xl bg-deep-blue px-4 py-2 text-sm font-extrabold text-white">Filtrele</button>
        </AdminFilterBar>
      </form>
      <AdminTable headers={["Başlık", "Tür", "Tarih", "Bölge", "Sorumlu", "Etki", "Durum", "Görünürlük", "İşlemler"]} recordCount={activities.length} empty={!activities.length}>
        {activities.map((activity) => (
          <tr key={activity.id}>
            <td className="px-4 py-3">
              <p className="font-bold text-dark-navy">{activity.title}</p>
              {activity.summary ? <p className="mt-1 max-w-xs text-xs font-semibold leading-5 text-ink-muted">{activity.summary}</p> : null}
            </td>
            <td className="px-4 py-3 text-ink-muted">{activity.activityTypeLabel}</td>
            <td className="px-4 py-3 text-ink-muted">{formatDate(activity.activityDate)}</td>
            <td className="px-4 py-3 text-ink-muted">{[activity.city, activity.district, activity.regionLabel].filter(Boolean).join(" / ") || "-"}</td>
            <td className="px-4 py-3 text-ink-muted">{activity.responsiblePerson ?? activity.teamName ?? "-"}</td>
            <td className="px-4 py-3 text-ink-muted">
              {activity.beneficiaryCount ? `${activity.beneficiaryCount} kişi` : "-"}
              {activity.distributedItemType ? <span className="block text-xs">{activity.distributedItemType}</span> : null}
            </td>
            <td className="px-4 py-3"><ProjectActivityStatusBadge status={activity.status} /></td>
            <td className="px-4 py-3"><ProjectActivityVisibilityBadge visibility={activity.visibility} /></td>
            <td className="px-4 py-3">
              <ActivityRowActions projectId={id} activityId={activity.id} source={source} status={activity.status} visibility={activity.visibility} />
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
