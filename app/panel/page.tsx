import { getCurrentPortalUser, getDonorDashboard, getPortalNotifications, getUserSupportedProjects, getVolunteerDashboard } from "@/lib/data/portalRepository";
import { PortalNotificationList } from "@/components/portal/PortalNotificationList";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
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
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Hesap yönlendirme merkezi</h1>
        <p className="mt-3 max-w-3xl leading-7 text-ink-muted">Bu alan hesap türünüze göre bağışçı veya gönüllü paneline geçiş yapmanızı sağlar. Demo kullanıcı iki profile de sahip olduğu için iki özet birlikte gösterilir.</p>
        <div className="mt-5 max-w-md">
          <div className="mb-2 flex justify-between text-sm font-bold text-dark-navy"><span>Profil tamamlama</span><span>{user.profileCompletion}%</span></div>
          <ProgressBar value={user.profileCompletion} />
        </div>
      </section>
      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Bağışçı akışı</p>
          <h2 className="mt-2 text-2xl font-bold text-dark-navy">Bağışlarım ve desteklerim</h2>
          <p className="mt-3 text-sm leading-6 text-ink-muted">Makbuz, sponsorluk, desteklenen proje ve tekrar bağış aksiyonları için bağışçı panelini kullanın.</p>
          <div className="mt-5"><Button href="/panel/bagisci">Bağışçı Paneline Git</Button></div>
        </article>
        <article className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Gönüllü akışı</p>
          <h2 className="mt-2 text-2xl font-bold text-dark-navy">Faaliyetlerim ve görevlerim</h2>
          <p className="mt-3 text-sm leading-6 text-ink-muted">Etkinlik, görev, duyuru ve koordinatör mesajları için gönüllü panelini kullanın.</p>
          <div className="mt-5"><Button href="/panel/gonullu" variant="ghost">Gönüllü Paneline Git</Button></div>
        </article>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Toplam bağış" value={formatCurrency(donor.profile.totalDonationAmount)} helper={`${donor.profile.totalDonationCount} işlem`} />
        <PortalStatCard label="Desteklenen proje" value={donor.profile.supportedProjectCount} />
        <PortalStatCard label="Gönüllü başvuru" value={volunteer.profile.applicationStatus} />
        <PortalStatCard label="Bildirim" value={notifications.length} />
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
