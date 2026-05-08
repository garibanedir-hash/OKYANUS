import { getVolunteerEvents } from "@/lib/data/portalRepository";
import { PortalEventCard } from "@/components/portal/PortalEventCard";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export default function CoordinatorActivitiesPage() {
  return <div className="grid gap-6"><AdminSectionHeader eyebrow="Faaliyet koordinasyonu" title="Sorumlu Faaliyetler" description="Kontenjan, katılım ve koordinatör bilgileri demo olarak listelenir." actionLabel="Faaliyet Planla" /><section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{getVolunteerEvents().map((event) => <PortalEventCard key={event.id} event={event} />)}</section></div>;
}
