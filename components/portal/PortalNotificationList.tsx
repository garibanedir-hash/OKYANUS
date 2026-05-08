import type { MockPortalNotification } from "@/data/portalMock";

export function PortalNotificationList({ notifications }: { notifications: MockPortalNotification[] }) {
  return (
    <div className="grid gap-3">
      {notifications.map((notification) => (
        <article key={notification.id} className="rounded-2xl border border-border-soft bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ocean-green">{notification.type}</p>
              <h2 className="mt-1 font-bold text-dark-navy">{notification.title}</h2>
            </div>
            <span className="rounded-full bg-soft-gray px-3 py-1 text-xs font-bold text-ink-muted">{notification.date}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{notification.summary}</p>
        </article>
      ))}
    </div>
  );
}
