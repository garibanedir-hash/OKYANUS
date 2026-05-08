import { getDonorDashboard } from "@/lib/data/portalRepository";
import { DonationHistoryTable } from "@/components/portal/DonationHistoryTable";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/format";

export default function DonorPanelPage() {
  const { profile, recentDonations, supportedProjects } = getDonorDashboard();

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-4 rounded-brand border border-border-soft bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Bağışçı paneli</p>
          <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Desteklerinizin özeti</h1>
          <p className="mt-2 leading-7 text-ink-muted">Kendi bağış, makbuz ve proje takiplerinizi görebileceğiniz demo alan.</p>
        </div>
        <Button href="/bagis-yap">Bağış Yap</Button>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Toplam bağış sayısı" value={profile.totalDonationCount} />
        <PortalStatCard label="Toplam bağış tutarı" value={formatCurrency(profile.totalDonationAmount)} />
        <PortalStatCard label="Desteklenen proje" value={profile.supportedProjectCount} />
        <PortalStatCard label="Aktif sponsorluk" value={profile.activeSponsorshipCount} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <DonationHistoryTable donations={recentDonations} />
        <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
          <h2 className="text-xl font-bold text-dark-navy">Desteklediğim projeler</h2>
          <div className="mt-4 grid gap-4">
            {supportedProjects.map((project) => (
              <article key={project.slug} className="rounded-2xl bg-soft-gray p-4">
                <div className="mb-2 flex justify-between text-sm font-bold"><span>{project.title}</span><span>%{project.progress}</span></div>
                <ProgressBar value={project.progress} />
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
