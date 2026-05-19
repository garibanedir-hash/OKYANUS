import { getNewsPostsWithSource } from "@/lib/data/newsRepository";
import { archiveNewsAction } from "@/app/admin/haberler/actions";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

const statusMessages: Record<string, string> = {
  "haber-olusturuldu": "Haber kaydı oluşturuldu.",
  "haber-guncellendi": "Haber kaydı güncellendi.",
  "haber-arsivlendi": "Haber arşivlendi.",
  hata: "İşlem tamamlanamadı. Lütfen tekrar deneyin.",
  yetkisiz: "Bu işlem için yetkili admin hesabınızla giriş yapmanız gerekiyor."
};

export default async function AdminNewsPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const params = await searchParams;
  const { data: news, source } = await getNewsPostsWithSource();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="İçerik Yönetimi"
        title="Haberler"
        description="Haber ve duyurular CMS içerik modeliyle listelenir. Oluşturma ve güncelleme server-side admin doğrulamasıyla yapılır."
        actionLabel="Yeni Haber Ekle"
        actionHref="/admin/haberler/yeni"
      />
      {params?.durum ? (
        <div className="rounded-lg border border-primary-blue/20 bg-soft-blue px-4 py-3 text-sm font-bold leading-6 text-deep-blue">
          {params.mesaj ?? statusMessages[params.durum] ?? "İşlem tamamlandı."}
        </div>
      ) : null}
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
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <AdminActionButton href={`/haberler/${item.slug}`}>İncele</AdminActionButton>
                <AdminActionButton href={`/admin/haberler/${item.id}/duzenle`}>Düzenle</AdminActionButton>
                <form action={archiveNewsAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="focus-ring inline-flex min-h-8 items-center justify-center rounded-md bg-warm-accent/15 px-2.5 py-1 text-[0.72rem] font-extrabold text-dark-navy ring-1 ring-warm-accent/25 transition hover:bg-warm-accent/25">
                    Arşivle
                  </button>
                </form>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
