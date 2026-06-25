import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { mockDonorDirectory } from "@/data/adminOperationsMock";

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-5 shadow-card">
      <p className="text-sm font-bold text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-dark-navy">{value}</p>
    </article>
  );
}

export default function AdminDonorDirectoryPage() {
  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Bağışçı ilişkileri"
        title="Bağışçı Listesi"
        description="Bağışçı kayıtları gerçek veri oluştuğunda maskeli ve yetki kontrollü şekilde listelenir."
      />
      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Toplam bağışçı" value={mockDonorDirectory.length} />
        <SummaryCard label="Düzenli bağışçı" value={1} />
        <SummaryCard label="Sponsorluk sahibi" value={1} />
        <SummaryCard label="Son 30 gün aktif" value={3} />
      </section>
      <AdminTable headers={["Ad soyad", "E-posta", "Telefon", "Toplam bağış", "Son bağış", "Proje", "Sponsorluk"]} recordCount={mockDonorDirectory.length} empty={!mockDonorDirectory.length}>
        {mockDonorDirectory.map((donor) => (
          <tr key={donor.email}>
            <td className="px-4 py-4 font-bold text-dark-navy">{donor.fullName}</td>
            <td className="px-4 py-4">{donor.email}</td>
            <td className="px-4 py-4">{donor.phone}</td>
            <td className="px-4 py-4">{donor.totalDonation}</td>
            <td className="px-4 py-4">{donor.lastDonation}</td>
            <td className="px-4 py-4">{donor.projectCount}</td>
            <td className="px-4 py-4"><AdminStatusBadge status={donor.sponsorship} /></td>
          </tr>
        ))}
      </AdminTable>
      <AdminPanelNotice title="KVKK uyarısı">
        Bağışçı kişisel verileri yalnızca yetkili roller tarafından görüntülenmelidir. Listeleme ekranında e-posta ve telefon alanları maskeli tutulmalıdır.
      </AdminPanelNotice>
    </div>
  );
}
