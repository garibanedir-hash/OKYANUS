import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export function AdminTaskStatusBadge({ status }: { status: string }) {
  return <AdminStatusBadge status={status} />;
}
