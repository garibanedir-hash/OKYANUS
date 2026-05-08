import type { MockStaffMember } from "@/data/adminMock";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export function AdminStaffCard({ staff }: { staff: MockStaffMember }) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-dark-navy">{staff.fullName}</h2>
          <p className="mt-1 text-sm font-semibold text-ink-muted">{staff.role}</p>
        </div>
        <AdminStatusBadge status={staff.status} />
      </div>
      <dl className="mt-5 grid gap-3 text-sm">
        <div><dt className="font-bold text-dark-navy">Sorumluluk</dt><dd className="text-ink-muted">{staff.responsibilityArea}</dd></div>
        <div><dt className="font-bold text-dark-navy">Son aktivite</dt><dd className="text-ink-muted">{staff.lastActivity}</dd></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-soft-gray p-3"><dt className="text-xs font-bold text-ink-muted">Atanan</dt><dd className="text-xl font-extrabold text-deep-blue">{staff.assignedTaskCount}</dd></div>
          <div className="rounded-2xl bg-soft-gray p-3"><dt className="text-xs font-bold text-ink-muted">Tamamlanan</dt><dd className="text-xl font-extrabold text-ocean-green">{staff.completedTaskCount}</dd></div>
        </div>
      </dl>
      <div className="mt-5 flex gap-2">
        <AdminActionButton>İletişim</AdminActionButton>
        <AdminActionButton variant="primary">Görev Ata</AdminActionButton>
      </div>
    </article>
  );
}
