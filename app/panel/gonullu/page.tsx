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
        <p className="mt-2 leading-7 text-ink-muted">Faaliyetler, etkinlikler, atanan görevler ve duyurular demo olarak burada toplanır.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <PortalStatCard label="Durum" value={profile.status} />
        <PortalStatCard label="Başvuru" value={profile.applicationStatus} />
        <PortalStatCard label="Katıldığı faaliyet" value={profile.joinedActivities} />
        <PortalStatCard label="Atanan görev" value={profile.assignedTasks} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <div className="grid gap-4 md:grid-cols-2">{events.slice(0, 2).map((event) => <PortalEventCard key={event.id} event={event} />)}</div>
        <div className="grid gap-4">
          <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card"><h2 className="text-xl font-bold text-dark-navy">Bana atanan görevler</h2><ul className="mt-3 grid gap-2 text-sm font-semibold text-ink-muted">{tasks.map((task) => <li key={task}>- {task}</li>)}</ul></div>
          <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card"><h2 className="text-xl font-bold text-dark-navy">Duyurular</h2><ul className="mt-3 grid gap-2 text-sm font-semibold text-ink-muted">{announcements.map((item) => <li key={item}>- {item}</li>)}</ul></div>
        </div>
      </section>
    </div>
  );
}
