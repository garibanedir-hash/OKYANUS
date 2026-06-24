import { getVolunteerDashboard } from "@/lib/data/portalRepository";
import { PortalEventCard } from "@/components/portal/PortalEventCard";
import { PortalStatCard } from "@/components/portal/PortalStatCard";

export default function VolunteerPanelPage() {
  const { profile, events, tasks, announcements } = getVolunteerDashboard();

  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Gönüllü paneli</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Gönüllülük yolculuğunuz</h1>
        <p className="mt-2 leading-7 text-ink-muted">Yaklaşan etkinlikler, görevler, duyurular, eğitim notları ve koordinatör mesajları bu panelde gönüllülük odağıyla toplanır.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <PortalStatCard label="Durum" value={profile.status} />
        <PortalStatCard label="Başvuru" value={profile.applicationStatus} />
        <PortalStatCard label="Katıldığı faaliyet" value={profile.joinedActivities} />
        <PortalStatCard label="Atanan görev" value={profile.assignedTasks} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {events.length ? events.slice(0, 2).map((event) => <PortalEventCard key={event.id} event={event} />) : (
            <div className="rounded-brand border border-dashed border-border-soft bg-white p-6 text-sm font-semibold leading-6 text-ink-muted shadow-card md:col-span-2">
              Henüz gönüllü faaliyet kaydı bulunmuyor.
            </div>
          )}
        </div>
        <div className="grid gap-4">
          <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card"><h2 className="text-xl font-bold text-dark-navy">Bana atanan görevler</h2>{tasks.length ? <ul className="mt-3 grid gap-2 text-sm font-semibold text-ink-muted">{tasks.map((task) => <li key={task}>- {task}</li>)}</ul> : <p className="mt-3 text-sm font-semibold leading-6 text-ink-muted">Henüz atanmış görev bulunmuyor.</p>}</div>
          <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card"><h2 className="text-xl font-bold text-dark-navy">Duyurular ve eğitim notları</h2>{announcements.length ? <ul className="mt-3 grid gap-2 text-sm font-semibold text-ink-muted">{announcements.map((item) => <li key={item}>- {item}</li>)}</ul> : <p className="mt-3 text-sm font-semibold leading-6 text-ink-muted">Duyurular eklendiğinde burada paylaşılacaktır.</p>}</div>
        </div>
      </section>
    </div>
  );
}
