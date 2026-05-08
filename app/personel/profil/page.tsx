import { getPersonnelDashboard } from "@/lib/data/accessRepository";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { Button } from "@/components/ui/Button";

export default function StaffProfilePage() {
  const { profile, accessRules } = getPersonnelDashboard();
  return <div className="grid gap-6"><AdminSectionHeader eyebrow="Personel profili" title="Profilim" description="Kendi profil ve erişim sınırı özetiniz." /><section className="rounded-brand border border-border-soft bg-white p-6 shadow-card"><h2 className="text-xl font-bold text-dark-navy">{profile.fullName}</h2><p className="mt-2 text-ink-muted">{profile.area}</p><ul className="mt-4 grid gap-2 text-sm text-ink-muted">{accessRules.map((rule) => <li key={rule}>- {rule}</li>)}</ul><div className="mt-5"><Button type="button">Demo Güncelle</Button></div></section></div>;
}
