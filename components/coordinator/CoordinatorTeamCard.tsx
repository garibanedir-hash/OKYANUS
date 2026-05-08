import type { MockStaffMember } from "@/data/adminMock";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export function CoordinatorTeamCard({ member }: { member: MockStaffMember }) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-dark-navy">{member.fullName}</h2>
          <p className="mt-1 text-sm text-ink-muted">{member.responsibilityArea}</p>
        </div>
        <AdminStatusBadge status={member.status} />
      </div>
      <p className="mt-4 text-sm font-bold text-deep-blue">{member.assignedTaskCount} açık görev / {member.completedTaskCount} tamamlandı</p>
    </article>
  );
}
