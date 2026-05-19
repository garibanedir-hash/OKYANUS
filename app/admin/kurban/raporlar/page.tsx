import { BarChart3, ClipboardList, FileText, MailCheck, MapPinned, Scissors } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { getQurbanStats } from "@/lib/data/qurbanRepository";

const reportCards: Array<{ title: string; description: string; icon: LucideIcon }> = [
  { title: "Ülke bazlı kurban raporu", description: "Bölge/ülke kırılımı ve hisse/adet dağılımı.", icon: MapPinned },
  { title: "Kurban türü bazlı rapor", description: "Vacip, adak, akika, şükür ve nafile dağılımı.", icon: BarChart3 },
  { title: "Vekalet durumu raporu", description: "Bekleyen, kabul edilen ve arşivlenen vekaletler.", icon: ClipboardList },
  { title: "Kesim durumu raporu", description: "Planlanan, tamamlanan ve rapor bekleyen operasyonlar.", icon: Scissors },
  { title: "Dağıtım raporu", description: "Paket, aile ve yararlanıcı grup özetleri.", icon: FileText },
  { title: "Bilgilendirme raporu", description: "E-posta/SMS hazırlık ve gönderim durumları.", icon: MailCheck }
];

export default async function AdminQurbanReportsPage() {
  const stats = await getQurbanStats();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Kurban Çalışmaları"
        title="Raporlar"
        description="Kurban operasyon raporları bu aşamada demo kartlar ve özet metriklerle hazırlanır. Gerçek CSV/XLSX/PDF üretimi sonraki aşamadadır."
        actionLabel="Export Hazırlığı"
        actionHref="/admin/kurban/export"
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reportCards.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
            <Icon aria-hidden className="h-6 w-6 text-ocean-green" />
            <h2 className="mt-4 text-lg font-extrabold text-dark-navy">{title}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-ink-muted">{description}</p>
            <div className="mt-4"><AdminActionButton>Rapor demo</AdminActionButton></div>
          </article>
        ))}
      </section>
      <section className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
        <h2 className="text-lg font-extrabold text-dark-navy">Özet dağılımlar</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-soft-gray p-4">
            <p className="text-xs font-extrabold uppercase text-ink-muted">Bölge dağılımı</p>
            <div className="mt-3 grid gap-2">
              {stats.regionBreakdown.map((item) => (
                <div key={item.label} className="flex justify-between text-sm font-bold text-dark-navy"><span>{item.label}</span><span>{item.value}</span></div>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-soft-gray p-4">
            <p className="text-xs font-extrabold uppercase text-ink-muted">Tür dağılımı</p>
            <div className="mt-3 grid gap-2">
              {stats.typeBreakdown.map((item) => (
                <div key={item.label} className="flex justify-between text-sm font-bold text-dark-navy"><span>{item.label}</span><span>{item.value}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
