import { reservationRows } from "@/data/adminOperationsMock";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminMeetingManagementPage() {
  return (
    <div className="grid gap-5">
      <AdminSectionHeader eyebrow="Toplantı ve Rezervasyon" title="Toplantı Yönetimi" description="Toplantı gündemi, birim ve durum bilgilerini takip etmek için yönetim ekranı." actionLabel="Toplantı Oluştur" />
      <AdminTable headers={["ID", "Birim", "Konu", "Tarih", "Saat", "Katılımcı", "Durum"]} recordCount={reservationRows.length}>
        {reservationRows.map((row) => (
          <tr key={row.id}>
            <td className="font-bold text-dark-navy">{row.id}</td>
            <td>{row.unit}</td>
            <td className="font-bold text-dark-navy">{row.subject}</td>
            <td>{row.useDate}</td>
            <td>{row.start}-{row.end}</td>
            <td>{row.participant}</td>
            <td><AdminStatusBadge status={row.status} /></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
