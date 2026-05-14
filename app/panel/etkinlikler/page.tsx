import { getVolunteerEvents } from "@/lib/data/portalRepository";
import { PortalEventCard } from "@/components/portal/PortalEventCard";

export default function PortalEventsPage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Etkinlik takvimi</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Yaklaşan Etkinlikler</h1>
        <p className="mt-2 leading-7 text-ink-muted">Gönüllü hesabınızla katılım gösterebileceğiniz etkinlikler ve koordinatör bilgileri.</p>
      </section>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{getVolunteerEvents().map((event) => <PortalEventCard key={event.id} event={event} />)}</section>
    </div>
  );
}
