import { getVolunteerEvents } from "@/lib/data/portalRepository";
import { PortalEventCard } from "@/components/portal/PortalEventCard";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export default function StaffActivitiesPage() {
  return <div className="grid gap-6"><AdminSectionHeader eyebrow="İlgili faaliyetler" title="Faaliyetlerim" description="Personelin görev aldığı faaliyetler demo olarak gösterilir." /><section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{getVolunteerEvents().slice(0, 2).map((event) => <PortalEventCard key={event.id} event={event} />)}</section></div>;
}
