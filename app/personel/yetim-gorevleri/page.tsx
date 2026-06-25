import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PrivacyNotice } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

export default async function StaffOrphanTasksPage() {
  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Personel Paneli"
        title="Yetim Görevleri"
        description="Size atanan yetim/sponsorluk görevleri gerçek kayıtlar oluştukça burada listelenir."
      />
      <PrivacyNotice />
      <AdminTable headers={["Görev", "Yetim kodu", "Sponsorluk", "Son tarih", "Durum", "Mahremiyet notu"]} recordCount={0} empty>
        {null}
      </AdminTable>
      <div className="rounded-lg border border-dashed border-border-soft bg-white p-5 text-sm font-semibold leading-6 text-ink-muted shadow-sm">
        Atanmış görev seçildiğinde mahremiyet kontrollü güncelleme alanı bu ekranda açılacaktır.
      </div>
    </div>
  );
}
