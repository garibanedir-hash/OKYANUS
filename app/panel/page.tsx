import { getCurrentPortalUser, getDonorDashboard, getPortalNotifications, getUserSupportedProjects, getVolunteerDashboard } from "@/lib/data/portalRepository";
import { PortalNotificationList } from "@/components/portal/PortalNotificationList";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/format";

export default function PortalHomePage() {
  const user = getCurrentPortalUser();
  const donor = getDonorDashboard();
  const volunteer = getVolunteerDashboard();
  const notifications = getPortalNotifications().slice(0, 3);
  const projects = getUserSupportedProjects();

  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Hesap özeti</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">İyilik yolculuğunuz</h1>
        <p className="mt-3 max-w-3xl leading-7 text-ink-muted">Bağışlarınızı, gönüllülük durumunuzu, desteklediğiniz projeleri ve bildirimlerinizi tek yerden takip etmek için hazırlanmış demo panel.</p>
        <div className="mt-5 max-w-md">
          <div className="mb-2 flex justify-between text-sm font-bold text-dark-navy"><span>Profil tamamlama</span><span>{user.profileCompletion}%</span></div>
          <ProgressBar value={user.profileCompletion} />
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Toplam bağış" value={formatCurrency(donor.profile.totalDonationAmount)} helper={`${donor.profile.totalDonationCount} işlem`} />
        <PortalStatCard label="Desteklenen proje" value={donor.profile.supportedProjectCount} />
        <PortalStatCard label="Gönüllü durumu" value={volunteer.profile.status} helper={volunteer.profile.applicationStatus} />
        <PortalStatCard label="Yaklaşan etkinlik" value={volunteer.events.length} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
          <h2 className="text-xl font-bold text-dark-navy">Desteklediğiniz ve önerilen projeler</h2>
          <div className="mt-4 grid gap-4">
            {projects.map((project) => (
              <article key={project.slug} className="rounded-2xl bg-soft-gray p-4">
                <div className="mb-2 flex justify-between gap-3 text-sm font-bold"><span className="text-dark-navy">{project.title}</span><span className="text-ocean-green">{project.relation}</span></div>
                <ProgressBar value={project.progress} />
                <p className="mt-2 text-xs font-semibold text-ink-muted">{project.status} / %{project.progress}</p>
              </article>
            ))}
          </div>
        </div>
        <PortalNotificationList notifications={notifications} />
      </section>
    </div>
  );
}
