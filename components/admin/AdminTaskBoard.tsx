import type { MockTask } from "@/data/adminMock";
import { AdminPriorityBadge } from "@/components/admin/AdminPriorityBadge";
import { AdminTaskStatusBadge } from "@/components/admin/AdminTaskStatusBadge";

export function AdminTaskBoard({ tasks }: { tasks: MockTask[] }) {
  const preview = tasks[0];

  if (!preview) return null;

  return (
    <aside className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ocean-green">Görev önizleme</p>
      <h2 className="mt-3 text-2xl font-bold text-dark-navy">{preview.title}</h2>
      <p className="mt-3 leading-7 text-ink-muted">{preview.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <AdminPriorityBadge priority={preview.priority} />
        <AdminTaskStatusBadge status={preview.status} />
      </div>
      <dl className="mt-6 grid gap-3 text-sm">
        <div><dt className="font-bold text-dark-navy">Atayan</dt><dd className="text-ink-muted">{preview.assignedBy}</dd></div>
        <div><dt className="font-bold text-dark-navy">Atanan</dt><dd className="text-ink-muted">{preview.assignedTo}</dd></div>
        <div><dt className="font-bold text-dark-navy">İlgili modül</dt><dd className="text-ink-muted">{preview.relatedEntityType}</dd></div>
        <div><dt className="font-bold text-dark-navy">Not</dt><dd className="text-ink-muted">{preview.internalNotes}</dd></div>
      </dl>
    </aside>
  );
}
