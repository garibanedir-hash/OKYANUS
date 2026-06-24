import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { mockVolunteerPool } from "@/data/adminOperationsMock";

function SummaryCard({ label, value }: { label: string | number; value: string | number }) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-5 shadow-card">
      <p className="text-sm font-bold text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-dark-navy">{value}</p>
    </article>
  );
}

export default function AdminVolunteerPoolPage() {
  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Gönüllü koordinasyonu"
        title="Gönüllü Havuzu"
        description="Gönüllülerin ilgi alanı, şehir, eğitim ve saha uygunluğu açısından takip edileceği demo ekran."
        actionLabel="Görev Ata"
      />
      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Toplam gönüllü" value={mockVolunteerPool.length} />
        <SummaryCard label="Aktif gönüllü" value={1} />
        <SummaryCard label="Eğitim almış" value={1} />
        <SummaryCard label="Sahaya uygun" value={2} />
      </section>
      <div className="grid gap-3 rounded-brand border border-border-soft bg-white p-4 shadow-card md:grid-cols-4">
        {["Şehir", "İlgi alanı", "Durum", "Koordinatör"].map((label) => (
          <label key={label} className="text-sm font-bold text-dark-navy">
            {label}
            <input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="Filtre" />
          </label>
        ))}
      </div>
      <AdminTable headers={["Ad soyad", "Şehir", "İlgi alanı", "Durum", "Faaliyet", "Son aktivite", "Koordinatör", "İşlem"]}>
        {mockVolunteerPool.map((volunteer) => (
          <tr key={`${volunteer.fullName}-${volunteer.city}`}>
            <td className="px-4 py-4 font-bold text-dark-navy">{volunteer.fullName}</td>
            <td className="px-4 py-4">{volunteer.city}</td>
            <td className="px-4 py-4">{volunteer.interestArea}</td>
            <td className="px-4 py-4"><AdminStatusBadge status={volunteer.status} /></td>
            <td className="px-4 py-4">{volunteer.activityCount}</td>
            <td className="px-4 py-4">{volunteer.lastActivity}</td>
            <td className="px-4 py-4">{volunteer.coordinator}</td>
            <td className="px-4 py-4 text-sm font-bold text-ocean-green">Profili İncele / Mesaj Gönder</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
