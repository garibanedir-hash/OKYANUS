import type { RecentActivity } from "@/data/adminAnalyticsMock";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export function AdminActivityFeed({ activities }: { activities: RecentActivity[] }) {
  return (
    <div className="grid gap-3">
      {activities.map((activity) => (
        <article key={activity.id} className="rounded-2xl border border-border-soft bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ocean-green">{activity.type}</p>
              <p className="mt-1 text-sm font-bold leading-6 text-dark-navy">{activity.description}</p>
              <p className="mt-1 text-xs font-semibold text-ink-muted">{activity.time}</p>
            </div>
            <AdminStatusBadge status={activity.status} />
          </div>
        </article>
      ))}
    </div>
  );
}
