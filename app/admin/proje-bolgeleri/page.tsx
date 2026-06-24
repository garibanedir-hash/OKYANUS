import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import {
  deactivateProjectRegionAction,
  setProjectRegionVisibilityAction
} from "@/app/admin/proje-bolgeleri/actions";
import { getAdminProjectRegions } from "@/lib/data/projectRegionRepository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const statusMessages: Record<string, string> = {
  "bolge-olusturuldu": "Proje bölgesi oluşturuldu.",
  "bolge-guncellendi": "Proje bölgesi güncellendi.",
  "bolge-pasif": "Proje bölgesi pasife alındı.",
  "bolge-gorunurluk": "Bölge görünürlüğü güncellendi.",
  hata: "İşlem tamamlanamadı. Lütfen alanları kontrol edin.",
  yetkisiz: "Bu işlem için yetkili admin hesabınızla giriş yapmanız gerekiyor."
};

export default async function AdminProjectRegionsPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const [params, regionsResult] = await Promise.all([searchParams, getAdminProjectRegions()]);
  const regions = regionsResult.data;
  const activeCount = regions.filter((region) => region.is_active).length;
  const publicCount = regions.filter((region) => region.visibility === "public").length;
  const linkedProjectCount = regions.reduce((sum, region) => sum + region.linkedProjectCount, 0);

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="İçerik Yönetimi"
        title="Proje Bölgeleri"
        description="Public proje haritasında görünen çalışma bölgelerini ve proje-bölge bağlantılarını yönetin."
        actionLabel="Yeni Bölge Ekle"
        actionHref="/admin/proje-bolgeleri/yeni"
      />

      {params?.durum ? (
        <div className="rounded-lg border border-primary-blue/20 bg-soft-blue px-4 py-3 text-sm font-bold leading-6 text-deep-blue">
          {params.mesaj ?? statusMessages[params.durum] ?? "İşlem tamamlandı."}
        </div>
      ) : null}

      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
        {regionsResult.source === "supabase" ? "Gerçek kayıt" : "Kayıt yok"}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMiniStat label="Toplam bölge" value={regions.length} />
        <AdminMiniStat label="Aktif bölge" value={activeCount} />
        <AdminMiniStat label="Public bölge" value={publicCount} />
        <AdminMiniStat label="Bağlı proje" value={linkedProjectCount} />
      </section>

      <AdminTable
        headers={["Bölge adı", "Slug", "Ülke", "Şehir/Bölge", "Harita konumu", "Durum", "Görünürlük", "Sıra", "Bağlı proje", "İşlemler"]}
        recordCount={regions.length}
        empty={!regions.length}
      >
        {regions.map((region) => (
          <tr key={region.id}>
            <td className="px-4 py-3 font-bold text-dark-navy">{region.name}</td>
            <td className="px-4 py-3 text-ink-muted">{region.slug}</td>
            <td className="px-4 py-3 text-ink-muted">{region.country ?? "-"}</td>
            <td className="px-4 py-3 text-ink-muted">{region.region_label ?? "-"}</td>
            <td className="px-4 py-3 text-ink-muted">{region.coords_lat !== null && region.coords_lng !== null ? "Hazır" : "Eksik"}</td>
            <td className="px-4 py-3">
              <AdminStatusBadge status={region.is_active ? "Aktif" : "Pasif"} />
            </td>
            <td className="px-4 py-3 text-ink-muted">{region.visibility === "public" ? "Public" : "İç kayıt"}</td>
            <td className="px-4 py-3 text-ink-muted">{region.sort_order ?? 0}</td>
            <td className="px-4 py-3 text-ink-muted">{region.linkedProjectCount}</td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <AdminActionButton href={`/admin/proje-bolgeleri/${region.id}/duzenle`}>Düzenle</AdminActionButton>
                <form action={setProjectRegionVisibilityAction}>
                  <input type="hidden" name="id" value={region.id} />
                  <input type="hidden" name="visibility" value={region.visibility === "public" ? "internal" : "public"} />
                  <button type="submit" className="focus-ring inline-flex min-h-8 items-center justify-center rounded-md bg-soft-blue px-2.5 py-1 text-[0.72rem] font-extrabold text-deep-blue ring-1 ring-primary-blue/20 transition hover:bg-primary-blue/10">
                    {region.visibility === "public" ? "İçe Al" : "Public Yap"}
                  </button>
                </form>
                {region.is_active ? (
                  <form action={deactivateProjectRegionAction}>
                    <input type="hidden" name="id" value={region.id} />
                    <button type="submit" className="focus-ring inline-flex min-h-8 items-center justify-center rounded-md bg-warm-accent/15 px-2.5 py-1 text-[0.72rem] font-extrabold text-dark-navy ring-1 ring-warm-accent/25 transition hover:bg-warm-accent/25">
                      Pasife Al
                    </button>
                  </form>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
