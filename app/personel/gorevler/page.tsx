import { getPersonnelDashboard } from "@/lib/data/accessRepository";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { StaffTaskTable } from "@/components/staff/StaffTaskTable";

export default function StaffTasksPage() {
  return <div className="grid gap-6"><AdminSectionHeader eyebrow="Kişisel görevler" title="Görevlerim" description="Sadece personele atanmış görevler gösterilir. Başlat, beklemeye al, tamamla ve not ekle aksiyonları demo modundadır." /><StaffTaskTable tasks={getPersonnelDashboard().tasks} /></div>;
}
