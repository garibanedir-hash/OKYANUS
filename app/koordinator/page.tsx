import { getCoordinatorDashboard } from "@/lib/data/accessRepository";
import { CoordinatorTeamCard } from "@/components/coordinator/CoordinatorTeamCard";
import { CoordinatorTaskOverview } from "@/components/coordinator/CoordinatorTaskOverview";
import { PortalStatCard } from "@/components/portal/PortalStatCard";

export default function CoordinatorHomePage() {
  const { profile, team, tasks, notes } = getCoordinatorDashboard();
  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Sınırlı koordinatör alanı</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">{profile.area}</h1>
        <p className="mt-2 leading-7 text-ink-muted">Koordinatör tüm sistemi değil, sadece sorumlu olduğu ekip ve faaliyet alanlarını görür.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3"><PortalStatCard label="Ekip üyesi" value={profile.teamSize} /><PortalStatCard label="Aktif görev" value={profile.activeTasks} /><PortalStatCard label="Bekleyen rapor" value={profile.pendingReports} /></section>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <CoordinatorTaskOverview tasks={tasks} />
        <div className="grid gap-4">{team.slice(0, 2).map((member) => <CoordinatorTeamCard key={member.id} member={member} />)}<div className="rounded-brand border border-border-soft bg-white p-5 shadow-card"><h2 className="font-bold text-dark-navy">Koordinasyon notları</h2><ul className="mt-3 grid gap-2 text-sm text-ink-muted">{notes.map((note) => <li key={note}>- {note}</li>)}</ul></div></div>
      </section>
    </div>
  );
}
