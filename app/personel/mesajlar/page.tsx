import { getPersonnelDashboard } from "@/lib/data/accessRepository";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { StaffMessagePanel } from "@/components/staff/StaffMessagePanel";

export default function StaffMessagesPage() {
  return <div className="grid gap-6"><AdminSectionHeader eyebrow="Kişisel iletişim" title="Mesajlarım" description="Personel sadece katılımcısı olduğu mesajları görür." /><StaffMessagePanel messages={getPersonnelDashboard().messages} /></div>;
}
