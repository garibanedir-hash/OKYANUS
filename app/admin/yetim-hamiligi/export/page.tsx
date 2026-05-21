import { Download, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export default function AdminOrphanExportPage() {
  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Yetim Hamiliği"
        title="Export Hazırlığı"
        description="CSV demo export arayüzü kişisel veri maskeleme varsayılan açık olacak şekilde hazırlanmıştır. Gerçek dosya üretimi sonraki aşamadadır."
      />
      <section className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <form className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold text-dark-navy">Başlangıç tarihi<input type="date" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" /></label>
            <label className="text-sm font-bold text-dark-navy">Bitiş tarihi<input type="date" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" /></label>
            <label className="text-sm font-bold text-dark-navy">Ülke/bölge<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="Türkiye, bölgesel takip..." /></label>
            <label className="text-sm font-bold text-dark-navy">Sponsorluk durumu<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3"><option>Tümü</option><option>Aktif</option><option>Ödeme bekliyor</option><option>Duraklatıldı</option></select></label>
            <label className="text-sm font-bold text-dark-navy">Ödeme durumu<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3"><option>Tümü</option><option>Bekliyor</option><option>Ödendi</option><option>Başarısız</option></select></label>
            <label className="flex items-start gap-3 rounded-2xl border border-border-soft bg-soft-gray p-4 text-sm font-bold leading-6 text-dark-navy">
              <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 accent-ocean-green" />
              Kişisel verileri maskele
            </label>
          </div>
          <button type="button" className="focus-ring mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-deep-blue px-4 py-2 text-sm font-extrabold text-white transition hover:bg-dark-navy">
            <Download aria-hidden className="h-4 w-4" />
            CSV Demo Export
          </button>
        </form>
        <aside className="grid gap-4">
          <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
            <ShieldCheck aria-hidden className="h-6 w-6 text-ocean-green" />
            <h2 className="mt-4 text-lg font-extrabold text-dark-navy">Maskeleme varsayılan açık</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">Export dosyalarında sponsor ve çocuk bilgileri minimum görünürlük ilkesiyle hazırlanmalıdır.</p>
          </div>
          <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
            <FileSpreadsheet aria-hidden className="h-6 w-6 text-ocean-green" />
            <h2 className="mt-4 text-lg font-extrabold text-dark-navy">XLSX/PDF sonraki aşama</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">Bu fazda dosya üretimi, imzalı URL ve audit/export log yazımı açılmamıştır.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
