import { getPortalNotifications } from "@/lib/data/portalRepository";
import { PortalNotificationList } from "@/components/portal/PortalNotificationList";

export default function PortalNotificationsPage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Bildirim merkezi</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Bildirimler</h1>
      </section>
      <PortalNotificationList notifications={getPortalNotifications()} />
    </div>
  );
}
