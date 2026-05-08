import type { MockTask } from "@/data/adminMock";
import { AdminTaskList } from "@/components/admin/AdminTaskList";

export function StaffTaskTable({ tasks }: { tasks: MockTask[] }) {
  return <AdminTaskList tasks={tasks} />;
}
