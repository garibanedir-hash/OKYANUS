import { reservationRows } from "@/data/adminOperationsMock";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminMeetingReservationPage() {
  return (
    <div className="grid gap-5">
      <AdminSectionHeader eyebrow="Toplantı ve Rezervasyon" title="Toplantı Rezervasyonu" description="Salon, online oda ve saha toplantı alanlarının kullanım kayıtları." actionLabel="Yeni Rezervasyon" />
      <AdminFilterBar showActions>
        <label>ID<input className="focus-ring mt-1 w-full border px-3" placeholder="RSV" /></label>
        <label>Kullanım amacı<input className="focus-ring mt-1 w-full border px-3" placeholder="Konu / amaç" /></label>
      </AdminFilterBar>
      <AdminTable headers={["Rezerve Tarihi", "Rezerve Edilen Yer", "Rezerve Eden Birim", "Konu", "Kullanım Tarihi", "Tekrarlama", "Başlangıç", "Bitiş", "Katılımcı", "Kaydı Açan", "Durum"]} recordCount={reservationRows.length}>
        {reservationRows.map((row) => (
          <tr key={row.id}>
            <td>{row.reservedAt}</td>
            <td className="font-bold text-dark-navy">{row.place}</td>
            <td>{row.unit}</td>
            <td>{row.subject}</td>
            <td>{row.useDate}</td>
            <td>{row.repeat}</td>
            <td>{row.start}</td>
            <td>{row.end}</td>
            <td>{row.participant}</td>
            <td>{row.opener}</td>
            <td><AdminStatusBadge status={row.status} /></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
