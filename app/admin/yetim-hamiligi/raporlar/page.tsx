import { BarChart3, ClipboardList, FileText, ShieldCheck, UserRoundCheck, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { getAdminSponsorshipStats } from "@/lib/data/orphanSponsorshipRepository";

const reportCards: Array<{ title: string; description: string; icon: LucideIcon }> = [
  { title: "Ülke bazlı yetim raporu", description: "Güvenli ülke/bölge kırılımı ve profil sayıları.", icon: BarChart3 },
  { title: "Sponsorluk durumu raporu", description: "Aktif, bekleyen, duraklatılmış ve tamamlanmış sponsorluklar.", icon: UserRoundCheck },
  { title: "Ödeme durumu raporu", description: "Ödeme bekleyen, ödenen ve hata durumları.", icon: WalletCards },
  { title: "Güncelleme bekleyenler", description: "Taslak ve mahremiyet kontrolü bekleyen içerikler.", icon: ClipboardList },
  { title: "Aktif sponsorlar", description: "Maskeli sponsor ve destek programı özetleri.", icon: FileText },
  { title: "Mahremiyet kontrol raporu", description: "Açık bilgi riski ve görünürlük seviyesi kontrolleri.", icon: ShieldCheck }
];

export default async function AdminOrphanReportsPage() {
  const stats = await getAdminSponsorshipStats();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Yetim Hamiliği"
        title="Raporlar"
        description="Yetim hamiliği raporları demo kartlar ve güvenli özet metriklerle hazırlanır. Gerçek CSV/XLSX/PDF üretimi sonraki aşamadadır."
        actionLabel="Export Hazırlığı"
        actionHref="/admin/yetim-hamiligi/export"
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
            <p className="text-xs font-extrabold uppercase text-ink-muted">Ülke dağılımı</p>
            <div className="mt-3 grid gap-2">
              {stats.countryBreakdown.map((item) => (
                <div key={item.label} className="flex justify-between text-sm font-bold text-dark-navy"><span>{item.label}</span><span>{item.value}</span></div>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-soft-gray p-4">
            <p className="text-xs font-extrabold uppercase text-ink-muted">Durum dağılımı</p>
            <div className="mt-3 grid gap-2">
              {stats.statusBreakdown.map((item) => (
                <div key={item.label} className="flex justify-between text-sm font-bold text-dark-navy"><span>{item.label}</span><span>{item.value}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
