import type { MockVolunteerEvent } from "@/data/portalMock";
import { AdminActionButton } from "@/components/admin/AdminActionButton";

export function PortalEventCard({ event }: { event: MockVolunteerEvent }) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-5 shadow-card">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ocean-green">{event.category}</p>
      <h2 className="mt-2 text-xl font-bold text-dark-navy">{event.title}</h2>
      <dl className="mt-4 grid gap-2 text-sm text-ink-muted">
        <div><dt className="font-bold text-dark-navy">Tarih</dt><dd>{event.date}</dd></div>
        <div><dt className="font-bold text-dark-navy">Yer</dt><dd>{event.location}</dd></div>
        <div><dt className="font-bold text-dark-navy">Kontenjan</dt><dd>{event.capacity}</dd></div>
        <div><dt className="font-bold text-dark-navy">Koordinatör</dt><dd>{event.coordinator}</dd></div>
      </dl>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="rounded-full bg-soft-blue px-3 py-1 text-xs font-bold text-deep-blue">{event.participationStatus}</span>
        <AdminActionButton variant="primary">Katılmak İstiyorum</AdminActionButton>
      </div>
    </article>
  );
}
