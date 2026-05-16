import { workRecords } from "@/data/adminOperationsMock";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminWorkRecordsPage() {
  return (
    <div className="grid gap-5">
      <AdminSectionHeader eyebrow="Operasyon" title="İş Kayıtları & Faaliyetler" description="Birim, faaliyet, sorumlu, durum ve bağlı kayıt ilişkileriyle kurum içi operasyon kayıtları." actionLabel="Yeni İş Kaydı" />
      <AdminFilterBar showActions>
        <label>ID<input className="focus-ring mt-1 w-full border px-3" placeholder="OKY-IS" /></label>
        <label>Birim<select className="focus-ring mt-1 w-full border px-3"><option>Tümü</option><option>Saha Operasyon</option><option>Bağış Birimi</option></select></label>
        <label>Kategori<select className="focus-ring mt-1 w-full border px-3"><option>Tümü</option><option>Kış Yardımı</option><option>Makbuz</option></select></label>
        <label>Sorumlu<input className="focus-ring mt-1 w-full border px-3" placeholder="Ad soyad" /></label>
        <label>Durum<select className="focus-ring mt-1 w-full border px-3"><option>Tümü</option><option>Yeni</option><option>Devam Ediyor</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["ID", "Birim", "Kategori", "İş Kaydı", "Sorumlu", "Durum", "Tarih", "Modül", "Bağlı Kayıt", "İşlem"]} recordCount={workRecords.length}>
        {workRecords.map((record) => (
          <tr key={record.id}>
            <td className="font-bold text-dark-navy">{record.id}</td>
            <td>{record.unit}</td>
            <td>{record.category}</td>
            <td className="font-bold text-dark-navy">{record.title}</td>
            <td>{record.owner}</td>
            <td><AdminStatusBadge status={record.status} /></td>
            <td>{record.date}</td>
            <td>{record.module}</td>
            <td>{record.relatedCount}</td>
            <td><AdminActionButton>Detayı Gör</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
