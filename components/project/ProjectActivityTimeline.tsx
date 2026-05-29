import type { PublicProjectActivity } from "@/data/projectActivityMock";

function formatDate(value?: string) {
  if (!value) return "Tarih güncellenecek";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function locationLabel(activity: PublicProjectActivity) {
  return [activity.regionLabel, activity.city, activity.district, activity.country].filter(Boolean).join(" / ");
}

export function ProjectActivityTimeline({ activities }: { activities: PublicProjectActivity[] }) {
  if (!activities.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Saha Güncellemeleri</p>
        <h2 className="mt-2 text-3xl font-extrabold text-dark-navy">Proje Faaliyetleri</h2>
        <p className="mt-3 text-base leading-7 text-ink-muted">
          Bu bölümde yalnızca tamamlanmış ve public görünür olarak işaretlenmiş faaliyet kayıtları yayınlanır.
        </p>
      </div>
      <div className="mt-8 grid gap-4">
        {activities.map((activity) => (
          <article key={activity.id} className="grid gap-4 border-l-4 border-ocean-green bg-white p-5 shadow-sm ring-1 ring-border-soft md:grid-cols-[13rem_minmax(0,1fr)]">
            <div>
              {activity.coverImageUrl ? (
                <div
                  aria-hidden="true"
                  className="mb-4 h-28 w-full rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${activity.coverImageUrl})` }}
                />
              ) : null}
              <p className="text-sm font-extrabold text-deep-blue">{formatDate(activity.activityDate)}</p>
              <p className="mt-2 text-xs font-bold leading-5 text-ink-muted">{locationLabel(activity) || activity.activityTypeLabel}</p>
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-soft-blue px-2.5 py-1 text-[0.68rem] font-extrabold text-deep-blue">
                  {activity.activityTypeLabel}
                </span>
                {activity.beneficiaryCount ? (
                  <span className="rounded-full bg-mint-green px-2.5 py-1 text-[0.68rem] font-extrabold text-dark-navy">
                    {activity.beneficiaryCount.toLocaleString("tr-TR")} kişiye ulaşıldı
                  </span>
                ) : null}
                {activity.familyCount ? (
                  <span className="rounded-full bg-soft-gray px-2.5 py-1 text-[0.68rem] font-extrabold text-ink-muted">
                    {activity.familyCount.toLocaleString("tr-TR")} aile
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 text-xl font-extrabold text-dark-navy">{activity.title}</h3>
              {activity.publicSummary ? (
                <p className="mt-2 text-sm leading-6 text-ink-muted">{activity.publicSummary}</p>
              ) : null}
              {activity.distributedItemType ? (
                <p className="mt-3 text-sm font-bold text-dark-navy">
                  Dağıtım: {activity.distributedItemType}
                  {activity.distributedItemCount ? ` - ${activity.distributedItemCount.toLocaleString("tr-TR")} adet` : ""}
                </p>
              ) : null}
              {activity.reportUrl ? (
                <a href={activity.reportUrl} className="mt-4 inline-flex text-sm font-extrabold text-deep-blue hover:underline">
                  Faaliyet raporunu aç
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
