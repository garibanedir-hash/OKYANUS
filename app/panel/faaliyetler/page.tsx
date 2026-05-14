import { getVolunteerEvents } from "@/lib/data/portalRepository";
import { PortalEventCard } from "@/components/portal/PortalEventCard";

export default function PortalActivitiesPage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Gönüllü faaliyetleri</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Katılabileceğim Faaliyetler</h1>
        <p className="mt-2 leading-7 text-ink-muted">Saha, eğitim, lojistik ve içerik desteği gibi gönüllülük alanlarına göre uygun faaliyetler.</p>
      </section>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{getVolunteerEvents().map((event) => <PortalEventCard key={event.id} event={event} />)}</section>
    </div>
  );
}
