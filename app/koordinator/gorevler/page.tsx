import { getCoordinatorDashboard } from "@/lib/data/accessRepository";
import { CoordinatorTaskOverview } from "@/components/coordinator/CoordinatorTaskOverview";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export default function CoordinatorTasksPage() {
  return <div className="grid gap-6"><AdminSectionHeader eyebrow="Koordinasyon" title="Ekip Görevleri" description="Sadece koordinatörün sorumlu olduğu ekip ve faaliyet görevleri gösterilir." actionLabel="Görev Ata" /><CoordinatorTaskOverview tasks={getCoordinatorDashboard().tasks} /></div>;
}
