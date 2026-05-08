import { mockDonations } from "@/data/adminMock";
import { donationSummary } from "@/data/adminAnalyticsMock";
import { projects } from "@/data/projects";
import { prepareDonationExport } from "@/lib/export/donationExport";
import { formatCurrency } from "@/lib/format";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminDonationsPage() {
  const exportPreview = prepareDonationExport(
    mockDonations,
    {
      projectSlug: "all",
      donationType: "all",
      paymentStatus: "all",
      receiptStatus: "all",
      maskPersonalData: true,
      summaryOnly: false
    },
    "csv"
  );
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(exportPreview.content ?? "")}`;

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Bağış Yönetimi"
        title="Bağışlar"
        description="Bu ekran gerçek ödeme kaydı tutmaz. Ödeme entegrasyonu sonrası gerçek bağış kayıtları burada listelenecektir."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminMiniStat label="Bugünkü bağış" value={formatCurrency(donationSummary.todayAmount)} />
        <AdminMiniStat label="Bu ayki bağış" value={formatCurrency(donationSummary.monthAmount)} />
        <AdminMiniStat label="Başarılı ödeme" value={donationSummary.successfulPayments} />
        <AdminMiniStat label="Bekleyen kayıt" value={donationSummary.pendingPayments} />
        <AdminMiniStat label="İptal / başarısız" value={donationSummary.failedPayments} />
      </section>
      <AdminPanelNotice title="Export ve raporlama demo hazırlığı">
        Bu alan gerçek ödeme verisi üretmez. CSV çıktısı mock kayıtlar üzerinden hazırlanır; Excel/XLSX ve PDF rapor akışı ileride backend, yetki kontrolü ve audit log ile bağlanacaktır.
      </AdminPanelNotice>
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Tarih aralığı<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Son 30 gün</option><option>Bugün</option><option>Bu yıl</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Proje<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tüm projeler</option>{projects.map((project) => <option key={project.slug}>{project.title}</option>)}</select></label>
        <label className="text-sm font-bold text-dark-navy">Bağış türü<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Gıda Desteği</option><option>Eğitim Desteği</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Ödeme durumu<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Ödendi</option><option>Beklemede</option><option>Demo</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Makbuz durumu<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Oluşturuldu</option><option>Bekliyor</option><option>Demo</option></select></label>
        <label className="flex items-center gap-3 rounded-2xl border border-border-soft px-4 py-3 text-sm font-bold text-dark-navy"><input className="h-4 w-4 rounded border-border-soft text-deep-blue" type="checkbox" defaultChecked />Kişisel verileri maskele</label>
        <label className="flex items-center gap-3 rounded-2xl border border-border-soft px-4 py-3 text-sm font-bold text-dark-navy"><input className="h-4 w-4 rounded border-border-soft text-deep-blue" type="checkbox" />Sadece özet rapor</label>
      </AdminFilterBar>
      <section className="grid gap-4 rounded-brand border border-border-soft bg-white p-5 shadow-card lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ocean-green">Dışa aktarma</p>
              <h2 className="mt-2 text-2xl font-bold text-dark-navy">Bağış raporu hazırlığı</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
                Tarih, proje, ödeme ve makbuz durumuna göre rapor üretme akışı hazırlandı. Production aşamasında bu işlem rol kontrolü ve export log ile çalışacak.
              </p>
            </div>
            <a
              className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full bg-deep-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-dark-navy"
              download={exportPreview.filename}
              href={csvHref}
            >
              CSV Dışa Aktar
            </a>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-bold text-dark-navy">Format<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>CSV</option><option>Excel / XLSX hazırlığı</option><option>PDF rapor hazırlığı</option></select></label>
            <AdminMiniStat label="Export satırı" value={exportPreview.rowCount} />
            <AdminMiniStat label="KVKK durumu" value={exportPreview.masked ? "Maskeli" : "Açık"} />
          </div>
        </div>
        <div className="rounded-2xl bg-soft-gray p-4">
          <p className="text-sm font-extrabold text-dark-navy">CSV önizleme</p>
          <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-2xl bg-white p-3 text-xs leading-5 text-ink-muted ring-1 ring-border-soft">
            {exportPreview.content}
          </pre>
        </div>
      </section>
      <AdminTable headers={["Bağışçı", "Tutar", "Bağış türü", "İlgili proje", "Tarih", "Ödeme durumu", "Makbuz durumu", "İşlemler"]}>
        {mockDonations.map((donation) => {
          const project = projects.find((item) => item.slug === donation.projectSlug);
          return (
            <tr key={donation.id}>
              <td className="px-4 py-3 font-bold text-dark-navy">{donation.donorName}</td>
              <td className="px-4 py-3 text-ink-muted">{formatCurrency(donation.amount)}</td>
              <td className="px-4 py-3 text-ink-muted">{donation.donationType}</td>
              <td className="px-4 py-3 text-ink-muted">{project?.title ?? "Genel bağış"}</td>
              <td className="px-4 py-3 text-ink-muted">{donation.date}</td>
              <td className="px-4 py-3"><AdminStatusBadge status={donation.paymentStatus} /></td>
              <td className="px-4 py-3"><AdminStatusBadge status={donation.receiptStatus} /></td>
              <td className="px-4 py-3"><div className="flex gap-2"><AdminActionButton>İncele</AdminActionButton><AdminActionButton>Makbuz</AdminActionButton></div></td>
            </tr>
          );
        })}
      </AdminTable>
      <section className="grid gap-4 md:grid-cols-3">
        <AdminMiniStat label="En çok bağış alan kategori" value={donationSummary.topCategory} />
        <AdminMiniStat label="Ortalama bağış" value={formatCurrency(donationSummary.averageDonation)} />
        <AdminMiniStat label="Son 30 gün trendi" value={donationSummary.thirtyDayTrend} />
      </section>
    </div>
  );
}
