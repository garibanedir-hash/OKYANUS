import { mockVolunteerApplications } from "@/data/adminMock";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminChartCard } from "@/components/admin/AdminChartCard";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminVolunteerApplicationsPage() {
  const cities = Array.from(new Set(mockVolunteerApplications.map((item) => item.city)));
  const interests = Array.from(new Set(mockVolunteerApplications.map((item) => item.interestArea)));
  const countByStatus = (status: string) => mockVolunteerApplications.filter((item) => item.status === status).length;

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Gönüllü Koordinasyonu"
        title="Gönüllü Başvuruları"
        description="Başvurular ilgi alanı, şehir ve durum bilgisine göre değerlendirilecek şekilde demo olarak listelenir."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminMiniStat label="Toplam başvuru" value={mockVolunteerApplications.length} />
        <AdminMiniStat label="Yeni başvuru" value={countByStatus("Yeni Başvuru")} />
        <AdminMiniStat label="İncelenen" value={countByStatus("İnceleniyor")} />
        <AdminMiniStat label="Görüşmeye davet" value={countByStatus("Görüşmeye Davet")} />
        <AdminMiniStat label="Tamamlanan süreç" value={countByStatus("Tamamlandı")} />
      </section>
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">İlgi Alanı<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option>{interests.map((interest) => <option key={interest}>{interest}</option>)}</select></label>
        <label className="text-sm font-bold text-dark-navy">Şehir<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
        <label className="text-sm font-bold text-dark-navy">Durum<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Yeni Başvuru</option><option>İnceleniyor</option><option>Görüşmeye Davet</option></select></label>
      </AdminFilterBar>
      <section className="grid gap-4 md:grid-cols-2">
        <AdminChartCard title="Şehir dağılımı" description="Demo başvuruların şehir yoğunluğu.">
          <div className="grid gap-2">
            {cities.map((city) => (
              <div key={city} className="flex justify-between rounded-2xl bg-soft-gray p-3 text-sm">
                <span className="font-bold text-dark-navy">{city}</span>
                <span className="font-extrabold text-deep-blue">{mockVolunteerApplications.filter((item) => item.city === city).length}</span>
              </div>
            ))}
          </div>
        </AdminChartCard>
        <AdminChartCard title="İlgi alanı dağılımı" description="Gönüllü ekip planlaması için ön görünüm.">
          <div className="grid gap-2">
            {interests.map((interest) => (
              <div key={interest} className="flex justify-between rounded-2xl bg-soft-gray p-3 text-sm">
                <span className="font-bold text-dark-navy">{interest}</span>
                <span className="font-extrabold text-deep-blue">{mockVolunteerApplications.filter((item) => item.interestArea === interest).length}</span>
              </div>
            ))}
          </div>
        </AdminChartCard>
      </section>
      <AdminTable headers={["Ad Soyad", "E-posta", "Telefon", "Şehir", "İlgi alanı", "Durum", "Tarih", "İşlemler"]}>
        {mockVolunteerApplications.map((application) => (
          <tr key={application.id}>
            <td className="px-4 py-3 font-bold text-dark-navy">{application.fullName}</td>
            <td className="px-4 py-3 text-ink-muted">{application.email}</td>
            <td className="px-4 py-3 text-ink-muted">{application.phone}</td>
            <td className="px-4 py-3 text-ink-muted">{application.city}</td>
            <td className="px-4 py-3 text-ink-muted">{application.interestArea}</td>
            <td className="px-4 py-3"><AdminStatusBadge status={application.status} /></td>
            <td className="px-4 py-3 text-ink-muted">{application.submittedAt}</td>
            <td className="px-4 py-3"><AdminActionButton>Başvuruyu İncele</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
