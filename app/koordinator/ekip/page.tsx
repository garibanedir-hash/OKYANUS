import { getCoordinatorDashboard } from "@/lib/data/accessRepository";
import { CoordinatorTeamCard } from "@/components/coordinator/CoordinatorTeamCard";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export default function CoordinatorTeamPage() {
  const { team } = getCoordinatorDashboard();
  return <div className="grid gap-6"><AdminSectionHeader eyebrow="Ekip" title="Sorumlu Ekip" description="Koordinatör sadece kendi ekibindeki personel özetlerini görür." /><section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{team.map((member) => <CoordinatorTeamCard key={member.id} member={member} />)}</section></div>;
}
