import type { MockTask } from "@/data/adminMock";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminPriorityBadge } from "@/components/admin/AdminPriorityBadge";
import { AdminTaskStatusBadge } from "@/components/admin/AdminTaskStatusBadge";

export function StaffTaskCard({ task }: { task: MockTask }) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-5 shadow-card">
      <div className="flex flex-wrap gap-2">
        <AdminPriorityBadge priority={task.priority} />
        <AdminTaskStatusBadge status={task.status} />
      </div>
      <h2 className="mt-3 text-xl font-bold text-dark-navy">{task.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{task.description}</p>
      <p className="mt-3 text-sm font-bold text-deep-blue">Termin: {task.dueDate}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <AdminActionButton variant="primary">Görevi Başlat</AdminActionButton>
        <AdminActionButton>Beklemeye Al</AdminActionButton>
        <AdminActionButton>Tamamlandı</AdminActionButton>
        <AdminActionButton>Not Ekle</AdminActionButton>
      </div>
    </article>
  );
}
