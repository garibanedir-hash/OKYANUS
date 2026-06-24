import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { ProjectActivityStatusBadge, ProjectActivityVisibilityBadge } from "@/components/admin/project-activities/ProjectActivityBadges";
import {
  getProjectActivityById,
  getProjectActivityEvents,
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
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: value.includes("T") ? "2-digit" : undefined,
    minute: value.includes("T") ? "2-digit" : undefined
  }).format(date);
}

function DetailItem({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border-soft bg-white px-4 py-3">
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      <div className="mt-1 text-sm font-bold leading-6 text-dark-navy">{value || "-"}</div>
    </div>
  );
}

function ActivityActionPanel({
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

  return (
    <div className="grid gap-2 rounded-lg border border-border-soft bg-white p-4 shadow-sm">
      <p className="text-sm font-extrabold text-dark-navy">İşlemler</p>
      <Link href={`/admin/projeler/${projectId}/faaliyetler/${activityId}/duzenle`} className="focus-ring inline-flex min-h-9 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-extrabold text-deep-blue ring-1 ring-border-soft hover:bg-soft-blue">
        Düzenle
      </Link>
      {!isDemo && !isTerminal && status !== "completed" ? (
        <form action={markProjectActivityCompletedAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="activityId" value={activityId} />
          <button type="submit" className="focus-ring w-full rounded-md bg-ocean-green px-3 py-2 text-sm font-extrabold text-white">
            Tamamlandı İşaretle
          </button>
        </form>
      ) : null}
      {!isDemo && !isTerminal && (visibility === "public" || status === "completed") ? (
        <form action={toggleProjectActivityVisibilityAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="activityId" value={activityId} />
          <button type="submit" className="focus-ring w-full rounded-md bg-soft-blue px-3 py-2 text-sm font-extrabold text-deep-blue">
            {visibility === "public" ? "İç Kayıt Yap" : "Public Yap"}
          </button>
        </form>
      ) : null}
      {!isDemo && !isTerminal ? (
        <form action={cancelProjectActivityAction} className="grid gap-2">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="activityId" value={activityId} />
          <textarea name="reason" required rows={3} placeholder="İptal gerekçesi" className="focus-ring rounded-md border border-border-soft px-3 py-2 text-sm" />
          <button type="submit" className="focus-ring rounded-md bg-warm-accent/15 px-3 py-2 text-sm font-extrabold text-dark-navy ring-1 ring-warm-accent/25">
            İptal Et
          </button>
        </form>
      ) : null}
      {!isDemo && status !== "archived" ? (
        <form action={archiveProjectActivityAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="activityId" value={activityId} />
          <button type="submit" className="focus-ring w-full rounded-md bg-white px-3 py-2 text-sm font-extrabold text-ink-muted ring-1 ring-border-soft">
            Arşivle
          </button>
        </form>
      ) : null}
      {isDemo ? <p className="text-xs font-bold leading-5 text-ink-muted">Gerçek kayıt bulunmadığı için aksiyonlar kapalıdır.</p> : null}
    </div>
  );
}

export default async function ProjectActivityDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string; activityId: string }>;
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const [{ id, activityId }, query] = await Promise.all([params, searchParams]);
  const [project, activityResult, events] = await Promise.all([
    getProjectActivityProjectSummary(id),
    getProjectActivityById(activityId),
    getProjectActivityEvents(activityId)
  ]);

  if (!project || !activityResult.data || activityResult.data.projectId !== id) notFound();

  const activity = activityResult.data;
  const statusMessage = query?.mesaj ?? (query?.durum ? statusMessages[query.durum] : null);

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Proje Operasyonları"
        title={activity.title}
        description={`${project.title} projesine bağlı faaliyet kaydı. Internal notlar sadece admin ekranında gösterilir.`}
        actionLabel="Listeye Dön"
        actionHref={`/admin/projeler/${id}/faaliyetler`}
      />
      {statusMessage ? (
        <div className="rounded-lg border border-primary-blue/20 bg-soft-blue px-4 py-3 text-sm font-bold leading-6 text-deep-blue">
          {statusMessage}
        </div>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-5">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminMiniStat label="Tarih" value={formatDate(activity.activityDate)} />
            <AdminMiniStat label="Yararlanıcı" value={activity.beneficiaryCount ?? "-"} />
            <AdminMiniStat label="Aile" value={activity.familyCount ?? "-"} />
            <AdminMiniStat label="Dağıtılan" value={activity.distributedItemCount ?? "-"} />
          </section>
          <section className="grid gap-3 rounded-lg border border-border-soft bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <ProjectActivityStatusBadge status={activity.status} />
              <ProjectActivityVisibilityBadge visibility={activity.visibility} />
              <span className="inline-flex min-h-7 items-center rounded-full bg-soft-gray px-2.5 py-1 text-[0.7rem] font-extrabold text-ink-muted">
                {activity.activityTypeLabel}
              </span>
              <span className="inline-flex min-h-7 items-center rounded-full bg-soft-blue px-2.5 py-1 text-[0.7rem] font-extrabold text-deep-blue">
                {activityResult.source === "supabase" ? "Gerçek kayıt" : "Kayıt yok"}
              </span>
            </div>
            <p className="text-sm font-semibold leading-6 text-ink-muted">{activity.summary ?? "Özet girilmemiş."}</p>
            {activity.description ? <p className="text-sm leading-6 text-dark-navy">{activity.description}</p> : null}
          </section>
          <section className="grid gap-3 md:grid-cols-2">
            <DetailItem label="Lokasyon" value={[activity.country, activity.city, activity.district, activity.locationName].filter(Boolean).join(" / ")} />
            <DetailItem label="Bölge Etiketi" value={activity.regionLabel} />
            <DetailItem label="Sorumlu" value={activity.responsiblePerson} />
            <DetailItem label="Ekip" value={activity.teamName} />
            <DetailItem label="Dağıtım Bilgisi" value={[activity.distributedItemType, activity.distributedItemCount ? `${activity.distributedItemCount} adet` : null].filter(Boolean).join(" - ")} />
            <DetailItem label="Tahmini Maliyet" value={activity.estimatedCost ? `${activity.estimatedCost.toLocaleString("tr-TR")} ${activity.currency}` : "-"} />
            <DetailItem label="Public Özet" value={activity.publicSummary} />
            <DetailItem label="İç Notlar" value={activity.internalNotes} />
            <DetailItem label="Kapak Görsel" value={activity.coverImageUrl ? <a href={activity.coverImageUrl} className="text-deep-blue hover:underline">Aç</a> : "-"} />
            <DetailItem label="Rapor" value={activity.reportUrl ? <a href={activity.reportUrl} className="text-deep-blue hover:underline">Aç</a> : "-"} />
            <DetailItem label="Tamamlanma" value={formatDate(activity.completedAt)} />
            <DetailItem label="Yayınlanma" value={formatDate(activity.publishedAt)} />
          </section>
          {activity.cancelledReason ? (
            <div className="rounded-lg border border-warm-accent/25 bg-warm-accent/10 px-4 py-3 text-sm font-bold leading-6 text-dark-navy">
              İptal gerekçesi: {activity.cancelledReason}
            </div>
          ) : null}
          <section className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
            <h2 className="text-lg font-extrabold text-dark-navy">Durum Geçmişi</h2>
            <div className="mt-3 grid gap-2">
              {events.length ? events.map((event) => (
                <div key={event.id} className="rounded-md border border-border-soft px-3 py-2 text-sm">
                  <p className="font-extrabold text-dark-navy">{event.eventType}</p>
                  <p className="text-xs font-semibold text-ink-muted">{formatDate(event.createdAt)} {event.note ? `- ${event.note}` : ""}</p>
                </div>
              )) : <p className="text-sm font-semibold text-ink-muted">Henüz event kaydı yok.</p>}
            </div>
          </section>
        </div>
        <ActivityActionPanel projectId={id} activityId={activity.id} source={activityResult.source} status={activity.status} visibility={activity.visibility} />
      </div>
    </div>
  );
}
