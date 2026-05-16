import type { MockTask } from "@/data/adminMock";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminPriorityBadge } from "@/components/admin/AdminPriorityBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminTaskStatusBadge } from "@/components/admin/AdminTaskStatusBadge";

export function AdminTaskList({ tasks }: { tasks: MockTask[] }) {
  return (
    <AdminTable headers={["İşlem", "Görev Konusu", "Sorumlu", "Görev Tarihi", "Kapatma Hedefi", "Kapanış", "İdari Avans", "Proje Avansı", "Aşama", "Harcama", "Kalan"]} recordCount={tasks.length}>
      {tasks.map((task) => (
        <tr key={task.id}>
          <td><AdminActionButton href={`/admin/gorevler/${task.id}`}>İncele</AdminActionButton></td>
          <td>
            <p className="font-bold text-dark-navy">{task.title}</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-ink-muted">{task.description}</p>
          </td>
          <td>{task.assignedTo}</td>
          <td>{task.createdAt}</td>
          <td>{task.dueDate}</td>
          <td>{task.completedAt ?? "-"}</td>
          <td>2.500 TL</td>
          <td>8.000 TL</td>
          <td><div className="flex gap-1.5"><AdminPriorityBadge priority={task.priority} /><AdminTaskStatusBadge status={task.status} /></div></td>
          <td>1.900 TL</td>
          <td>8.600 TL</td>
        </tr>
      ))}
    </AdminTable>
  );
}
