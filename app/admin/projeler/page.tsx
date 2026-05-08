import { projects } from "@/data/projects";
import { formatCurrency } from "@/lib/format";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminChartCard } from "@/components/admin/AdminChartCard";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminProjectsPage() {
  const activeCount = projects.filter((project) => project.status === "Devam Ediyor").length;
  const completedCount = projects.filter((project) => project.status === "Tamamlandı").length;
  const plannedCount = projects.filter((project) => project.status === "Planlanıyor").length;
  const totalRaised = projects.reduce((sum, project) => sum + project.raised, 0);

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="İçerik Yönetimi"
        title="Projeler"
        description="Projeler CMS veya backend entegrasyonuna hazır veri modeliyle listelenir. İşlemler demo modundadır."
        actionLabel="Yeni Proje Ekle"
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMiniStat label="Toplam proje" value={projects.length} />
        <AdminMiniStat label="Aktif proje" value={activeCount} />
        <AdminMiniStat label="Tamamlanan proje" value={completedCount} />
        <AdminMiniStat label="Taslak / planlanan" value={plannedCount} />
      </section>
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Arama<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="Proje adı ara" /></label>
        <label className="text-sm font-bold text-dark-navy">Kategori<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Gıda</option><option>Eğitim</option><option>Sağlık</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Durum<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Devam Ediyor</option><option>Planlanıyor</option><option>Tamamlandı</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Proje adı", "Kategori", "Durum", "Lokasyon", "Hedef destek", "Ulaşılan destek", "İlerleme", "Güncelleme", "İşlemler"]}>
        {projects.map((project) => {
          const progress = Math.round((project.raised / project.goal) * 100);
          return (
            <tr key={project.id}>
              <td className="px-4 py-3 font-bold text-dark-navy">{project.title}</td>
              <td className="px-4 py-3 text-ink-muted">{project.category}</td>
              <td className="px-4 py-3"><AdminStatusBadge status={project.status} /></td>
              <td className="px-4 py-3 text-ink-muted">{project.location}</td>
              <td className="px-4 py-3 text-ink-muted">{formatCurrency(project.goal)}</td>
              <td className="px-4 py-3 text-ink-muted">{formatCurrency(project.raised)}</td>
              <td className="px-4 py-3">
                <div className="min-w-28">
                  <div className="h-2 rounded-full bg-soft-gray">
                    <div className="h-full rounded-full bg-ocean-green" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs font-bold text-deep-blue">%{progress}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-ink-muted">{project.updatedAt}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <AdminActionButton href={`/projeler/${project.slug}`}>İncele</AdminActionButton>
                  <AdminActionButton>Düzenle</AdminActionButton>
                  <AdminActionButton variant="danger">Yayından kaldır</AdminActionButton>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>
      <AdminChartCard title="Proje performans özeti" description="Demo proje portföyünün destek ve durum dağılımı.">
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminMiniStat label="Toplam ulaşılan destek" value={formatCurrency(totalRaised)} />
          <AdminMiniStat label="En yüksek kategori" value="Sağlık" />
          <AdminMiniStat label="Ortalama ilerleme" value={`%${Math.round(projects.reduce((sum, project) => sum + project.raised / project.goal, 0) / projects.length * 100)}`} />
        </div>
      </AdminChartCard>
    </div>
  );
}
