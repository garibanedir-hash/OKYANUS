import type { MockTask } from "@/data/adminMock";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminPriorityBadge } from "@/components/admin/AdminPriorityBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminTaskStatusBadge } from "@/components/admin/AdminTaskStatusBadge";

export function AdminTaskList({ tasks }: { tasks: MockTask[] }) {
  return (
    <AdminTable headers={["Görev", "Atanan", "Öncelik", "Durum", "Modül", "Termin", "İşlemler"]}>
      {tasks.map((task) => (
        <tr key={task.id}>
          <td className="px-4 py-3">
            <p className="font-bold text-dark-navy">{task.title}</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-ink-muted">{task.description}</p>
          </td>
          <td className="px-4 py-3 text-ink-muted">{task.assignedTo}</td>
          <td className="px-4 py-3"><AdminPriorityBadge priority={task.priority} /></td>
          <td className="px-4 py-3"><AdminTaskStatusBadge status={task.status} /></td>
          <td className="px-4 py-3 text-ink-muted">{task.relatedEntityType}</td>
          <td className="px-4 py-3 text-ink-muted">{task.dueDate}</td>
          <td className="px-4 py-3"><AdminActionButton>Görevi İncele</AdminActionButton></td>
        </tr>
      ))}
    </AdminTable>
  );
}
