import { getVolunteerEvents } from "@/lib/data/portalRepository";
import { PortalEventCard } from "@/components/portal/PortalEventCard";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export default function StaffActivitiesPage() {
  const events = getVolunteerEvents().slice(0, 2);

  return (
    <div className="grid gap-6">
      <AdminSectionHeader eyebrow="İlgili faaliyetler" title="Faaliyetlerim" description="Personelin görev aldığı faaliyetler gerçek kayıtlar oluştukça burada listelenir." />
      {events.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{events.map((event) => <PortalEventCard key={event.id} event={event} />)}</section>
      ) : (
        <div className="rounded-lg border border-border-soft bg-white p-6 text-sm font-semibold leading-6 text-ink-muted shadow-sm">
          Henüz personele atanmış faaliyet kaydı bulunmuyor.
        </div>
      )}
    </div>
  );
}
