import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
export default async function StaffQurbanTasksPage() {
  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Personel Paneli"
        title="Kurban Görevleri"
        description="Size atanan kurban kesim/dağıtım görevleri gerçek kayıtlar oluştukça burada listelenir."
      />
      <div className="rounded-lg border border-border-soft bg-white p-4 text-sm font-semibold leading-6 text-ink-muted shadow-sm">
        Bu ekran görev ve saha takip mantığını gösterir; bağışçı kişisel verisi veya hassas operasyon dosyası içermez.
      </div>
      <AdminTable headers={["Görev", "Tarih", "Bölge", "Kesim/Dağıtım", "Hisse durumu", "Durum", "Notlar"]} recordCount={0} empty>
        {null}
      </AdminTable>
      <div className="rounded-lg border border-dashed border-border-soft bg-white p-5 text-sm font-semibold leading-6 text-ink-muted shadow-sm">
        Atanmış görev seçildiğinde saha raporu alanı bu ekranda açılacaktır.
      </div>
    </div>
  );
}
