import { getNewsPostsWithSource } from "@/lib/data/newsRepository";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default async function AdminNewsPage() {
  const { data: news, source } = await getNewsPostsWithSource();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="İçerik Yönetimi"
        title="Haberler"
        description="Haber ve duyurular CMS içerik modeliyle listelenir. Yeni haber ekleme demo aksiyondur."
        actionLabel="Yeni Haber Ekle"
      />
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
        Veri kaynağı: {source === "supabase" ? "Supabase read-only" : "Demo fallback"}
      </div>
      <div className="grid gap-3 rounded-brand border border-border-soft bg-white p-4 shadow-card md:grid-cols-2">
        <label className="text-sm font-bold text-dark-navy">Arama<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="Haber başlığı ara" /></label>
        <label className="text-sm font-bold text-dark-navy">Kategori<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Faaliyet</option><option>Gönüllülük</option><option>Kampanya</option></select></label>
      </div>
      <AdminTable headers={["Haber başlığı", "Kategori", "Tarih", "İlgili proje/faaliyet", "Yayın durumu", "İşlemler"]} recordCount={news.length} empty={!news.length}>
        {news.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3 font-bold text-dark-navy">{item.title}</td>
            <td className="px-4 py-3 text-ink-muted">{item.category}</td>
            <td className="px-4 py-3 text-ink-muted">{item.date}</td>
            <td className="px-4 py-3 text-ink-muted">{item.relatedProjectSlug ?? item.relatedActivitySlug ?? "Yok"}</td>
            <td className="px-4 py-3"><AdminStatusBadge status="Yayında" /></td>
            <td className="px-4 py-3"><div className="flex gap-2"><AdminActionButton href={`/haberler/${item.slug}`}>İncele</AdminActionButton><AdminActionButton>Düzenle</AdminActionButton></div></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
