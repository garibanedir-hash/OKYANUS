import type { MockTask } from "@/data/adminMock";
import { AdminPriorityBadge } from "@/components/admin/AdminPriorityBadge";
import { AdminRelatedRecordsModal } from "@/components/admin/AdminRelatedRecordsModal";
import { AdminTaskStatusBadge } from "@/components/admin/AdminTaskStatusBadge";

export function AdminTaskBoard({ tasks }: { tasks: MockTask[] }) {
  const preview = tasks[0];

  if (!preview) return null;

  return (
    <aside className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-ocean-green">Görev detay önizleme</p>
      <h2 className="mt-2 text-xl font-extrabold text-dark-navy">{preview.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{preview.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <AdminPriorityBadge priority={preview.priority} />
        <AdminTaskStatusBadge status={preview.status} />
      </div>
      <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-md bg-soft-gray p-3"><dt className="text-xs font-extrabold uppercase text-ink-muted">Atayan</dt><dd className="mt-1 font-bold text-dark-navy">{preview.assignedBy}</dd></div>
        <div className="rounded-md bg-soft-gray p-3"><dt className="text-xs font-extrabold uppercase text-ink-muted">Atanan</dt><dd className="mt-1 font-bold text-dark-navy">{preview.assignedTo}</dd></div>
        <div className="rounded-md bg-soft-gray p-3"><dt className="text-xs font-extrabold uppercase text-ink-muted">Modül</dt><dd className="mt-1 font-bold text-dark-navy">{preview.relatedEntityType}</dd></div>
        <div className="rounded-md bg-soft-gray p-3"><dt className="text-xs font-extrabold uppercase text-ink-muted">Termin</dt><dd className="mt-1 font-bold text-dark-navy">{preview.dueDate}</dd></div>
      </dl>
      <div className="mt-4 rounded-md border border-border-soft p-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-muted">Not / açıklama</p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{preview.internalNotes}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <AdminRelatedRecordsModal
          title="Bağlı alt kayıtlar"
          triggerLabel="Bağlı Kayıtları Gör"
          headers={["Kayıt", "Tür", "Durum", "Tarih"]}
          rows={[
            [preview.title, preview.relatedEntityType, preview.status, preview.updatedAt],
            ["İç koordinasyon notu", "Not", "Hazırlanıyor", preview.createdAt],
            ["Saha takip kaydı", "Operasyon", preview.priority, preview.dueDate]
          ]}
        />
      </div>
    </aside>
  );
}
