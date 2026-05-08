import { getPersonnelDashboard } from "@/lib/data/accessRepository";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { StaffMessagePanel } from "@/components/staff/StaffMessagePanel";
import { StaffTaskCard } from "@/components/staff/StaffTaskCard";

export default function StaffHomePage() {
  const { profile, tasks, messages } = getPersonnelDashboard();
  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Kişisel personel alanı</p><h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Görev ve mesaj özetiniz</h1><p className="mt-2 leading-7 text-ink-muted">Personel sadece kendisine atanan işleri, kendi mesajlarını ve profil bilgilerini görebilir.</p></section>
      <section className="grid gap-4 md:grid-cols-3"><PortalStatCard label="Açık görev" value={profile.openTasks} /><PortalStatCard label="Okunmamış mesaj" value={profile.unreadMessages} /><PortalStatCard label="Bu ay tamamlanan" value={profile.completedThisMonth} /></section>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]"><div className="grid gap-4">{tasks.map((task) => <StaffTaskCard key={task.id} task={task} />)}</div><StaffMessagePanel messages={messages} /></section>
    </div>
  );
}
