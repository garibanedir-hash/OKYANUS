import { formatCurrency } from "@/lib/format";
import { getProjectsWithSource } from "@/lib/data/projectsRepository";
import { archiveProjectAction } from "@/app/admin/projeler/actions";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminChartCard } from "@/components/admin/AdminChartCard";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

const statusMessages: Record<string, string> = {
  "proje-olusturuldu": "Proje kaydı oluşturuldu.",
  "proje-guncellendi": "Proje kaydı güncellendi.",
  "proje-arsivlendi": "Proje arşivlendi.",
  hata: "İşlem tamamlanamadı. Lütfen tekrar deneyin.",
  yetkisiz: "Bu işlem için yetkili admin hesabınızla giriş yapmanız gerekiyor."
};

export default async function AdminProjectsPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const params = await searchParams;
  const { data: projects, source } = await getProjectsWithSource();
  const activeCount = projects.filter((project) => project.status === "Devam Ediyor").length;
  const completedCount = projects.filter((project) => project.status === "Tamamlandı").length;
  const plannedCount = projects.filter((project) => project.status === "Planlanıyor").length;
  const totalRaised = projects.reduce((sum, project) => sum + project.raised, 0);
  const averageProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + (project.goal > 0 ? project.raised / project.goal : 0), 0) / projects.length * 100)
    : 0;
  const topCategory =
    projects
      .reduce<Array<{ category: string; count: number }>>((items, project) => {
        const item = items.find((entry) => entry.category === project.category);
        if (item) item.count += 1;
        else items.push({ category: project.category, count: 1 });
        return items;
      }, [])
      .sort((a, b) => b.count - a.count)[0]?.category ?? "Yok";

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="İçerik Yönetimi"
        title="Projeler"
        description="Projeler CMS veya backend entegrasyonuna hazır veri modeliyle listelenir. Oluşturma ve güncelleme server-side admin doğrulamasıyla yapılır."
        actionLabel="Yeni Proje Ekle"
        actionHref="/admin/projeler/yeni"
      />
      {params?.durum ? (
        <div className="rounded-lg border border-primary-blue/20 bg-soft-blue px-4 py-3 text-sm font-bold leading-6 text-deep-blue">
          {params.mesaj ?? statusMessages[params.durum] ?? "İşlem tamamlandı."}
        </div>
      ) : null}
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
        Veri kaynağı: {source === "supabase" ? "Supabase read-only" : "Demo fallback"}
      </div>
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
      <AdminTable headers={["Proje adı", "Kategori", "Durum", "Lokasyon", "Hedef destek", "Ulaşılan destek", "İlerleme", "Güncelleme", "İşlemler"]} recordCount={projects.length} empty={!projects.length}>
        {projects.map((project) => {
          const progress = project.goal > 0 ? Math.round((project.raised / project.goal) * 100) : 0;
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
                  <AdminActionButton href={`/admin/projeler/${project.id}/duzenle`}>Düzenle</AdminActionButton>
                  <form action={archiveProjectAction}>
                    <input type="hidden" name="id" value={project.id} />
                    <button type="submit" className="focus-ring inline-flex min-h-8 items-center justify-center rounded-md bg-warm-accent/15 px-2.5 py-1 text-[0.72rem] font-extrabold text-dark-navy ring-1 ring-warm-accent/25 transition hover:bg-warm-accent/25">
                      Arşivle
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>
      <AdminChartCard title="Proje performans özeti" description="Demo proje portföyünün destek ve durum dağılımı.">
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminMiniStat label="Toplam ulaşılan destek" value={formatCurrency(totalRaised)} />
          <AdminMiniStat label="En yüksek kategori" value={topCategory} />
          <AdminMiniStat label="Ortalama ilerleme" value={`%${averageProgress}`} />
        </div>
      </AdminChartCard>
    </div>
  );
}
