import Link from "next/link";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { ProjectActivityStatusBadge, ProjectActivityVisibilityBadge } from "@/components/admin/project-activities/ProjectActivityBadges";
import { projectActivityStatusLabels, projectActivityTypeLabels, projectActivityVisibilityLabels } from "@/data/projectActivityMock";
import { getAdminProjectActivities } from "@/lib/data/projectActivityRepository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default async function AdminAllProjectActivitiesPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string; visibility?: string; activityType?: string }>;
}) {
  const query = await searchParams;
  const { data: activities, source } = await getAdminProjectActivities({
    status: query?.status,
    visibility: query?.visibility,
    activityType: query?.activityType
  });

  const completedCount = activities.filter((activity) => activity.status === "completed").length;
  const publicCount = activities.filter((activity) => activity.status === "completed" && activity.visibility === "public").length;
  const internalCount = activities.filter((activity) => activity.visibility === "internal").length;

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Operasyon Kayıtları"
        title="Faaliyet Kayıtları"
        description="Tüm projelere bağlı saha, dağıtım ve raporlama faaliyetlerini tek ekrandan izleyin. Yeni kayıt eklemek için ilgili projenin faaliyet ekranını kullanın."
      />
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
        Veri kaynağı: {source === "supabase" ? "Supabase" : "Demo fallback"}
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMiniStat label="Toplam faaliyet" value={activities.length} />
        <AdminMiniStat label="Tamamlanan" value={completedCount} />
        <AdminMiniStat label="Public" value={publicCount} />
        <AdminMiniStat label="İç kayıt" value={internalCount} />
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
      <AdminTable headers={["Proje", "Faaliyet", "Tür", "Tarih", "Bölge", "Durum", "Görünürlük", "İşlem"]} recordCount={activities.length} empty={!activities.length}>
        {activities.map((activity) => (
          <tr key={activity.id}>
            <td className="px-4 py-3 font-bold text-dark-navy">{activity.projectTitle ?? "-"}</td>
            <td className="px-4 py-3">
              <p className="font-bold text-dark-navy">{activity.title}</p>
              {activity.summary ? <p className="mt-1 max-w-xs text-xs font-semibold leading-5 text-ink-muted">{activity.summary}</p> : null}
            </td>
            <td className="px-4 py-3 text-ink-muted">{activity.activityTypeLabel}</td>
            <td className="px-4 py-3 text-ink-muted">{formatDate(activity.activityDate)}</td>
            <td className="px-4 py-3 text-ink-muted">{[activity.city, activity.regionLabel].filter(Boolean).join(" / ") || "-"}</td>
            <td className="px-4 py-3"><ProjectActivityStatusBadge status={activity.status} /></td>
            <td className="px-4 py-3"><ProjectActivityVisibilityBadge visibility={activity.visibility} /></td>
            <td className="px-4 py-3">
              <Link href={`/admin/projeler/${activity.projectId}/faaliyetler/${activity.id}`} className="focus-ring inline-flex min-h-8 items-center rounded-md bg-white px-2.5 py-1 text-[0.72rem] font-extrabold text-deep-blue ring-1 ring-border-soft hover:bg-soft-blue">
                Detay
              </Link>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
