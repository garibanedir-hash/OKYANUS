import { reservationRows } from "@/data/adminOperationsMock";
import { AdminChartCard } from "@/components/admin/AdminChartCard";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export default function AdminReservationCalendarPage() {
  return (
    <div className="grid gap-5">
      <AdminSectionHeader eyebrow="Toplantı ve Rezervasyon" title="Rezervasyon Takvimi" description="Demo takvim görünümü; gerçek takvim entegrasyonu sonraki aşamada bağlanacaktır." />
      <section className="grid gap-3 md:grid-cols-3">
        {reservationRows.map((row) => (
          <AdminChartCard key={row.id} title={row.place} description={`${row.useDate} · ${row.start}-${row.end}`}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-bold text-dark-navy">{row.subject}</span>
              <AdminStatusBadge status={row.status} />
            </div>
            <p className="mt-2 text-xs font-semibold text-ink-muted">{row.unit} · {row.participant} katılımcı</p>
          </AdminChartCard>
        ))}
      </section>
    </div>
  );
}
