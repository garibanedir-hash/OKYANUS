import { AdminFormActions } from "@/components/admin/AdminFormShell";
import { AdminSelect, AdminTextInput, AdminTextarea } from "@/components/admin/AdminFormFields";
import type { AdminProjectRegion } from "@/lib/data/projectRegionRepository";

type ProjectRegionFormValues = {
  id?: string;
  name: string;
  slug: string;
  country: string;
  regionLabel: string;
  tagline: string;
  description: string;
  shortDescription: string;
  coordsLng: string | number;
  coordsLat: string | number;
  priorityLabel: string;
  operatingModel: string;
  beneficiaryEstimate: string;
  activeProjectCount: string | number;
  focusAreasText: string;
  categoriesText: string;
  coverImageUrl: string;
  sortOrder: string | number;
  isActive: boolean;
  visibility: "public" | "internal";
  relatedProjectSlugsText: string;
  recentUpdatesText: string;
};

const emptyRegion: ProjectRegionFormValues = {
  name: "",
  slug: "",
  country: "",
  regionLabel: "",
  tagline: "",
  description: "",
  shortDescription: "",
  coordsLng: "",
  coordsLat: "",
  priorityLabel: "",
  operatingModel: "",
  beneficiaryEstimate: "",
  activeProjectCount: "",
  focusAreasText: "",
  categoriesText: "",
  coverImageUrl: "",
  sortOrder: 0,
  isActive: true,
  visibility: "public",
  relatedProjectSlugsText: "",
  recentUpdatesText: ""
};

function stringArrayFromMetadata(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join("\n") : "";
}

function recentUpdatesFromMetadata(value: unknown) {
  if (!Array.isArray(value)) return "";

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const update = item as { title?: unknown; dateLabel?: unknown; summary?: unknown };
      if (typeof update.title !== "string" || typeof update.summary !== "string") return "";
      return `${update.title} | ${typeof update.dateLabel === "string" ? update.dateLabel : "Saha güncellemesi"} | ${update.summary}`;
    })
    .filter(Boolean)
    .join("\n");
}

function mapRegionToValues(region?: AdminProjectRegion | null): ProjectRegionFormValues {
  if (!region) return emptyRegion;
  const metadata = region.metadata && typeof region.metadata === "object" ? region.metadata : {};

  return {
    id: region.id,
    name: region.name,
    slug: region.slug,
    country: region.country ?? "",
    regionLabel: region.region_label ?? "",
    tagline: region.tagline ?? "",
    description: region.description ?? "",
    shortDescription: region.short_description ?? "",
    coordsLng: region.coords_lng ?? "",
    coordsLat: region.coords_lat ?? "",
    priorityLabel: region.priority_label ?? "",
    operatingModel: region.operating_model ?? "",
    beneficiaryEstimate: region.beneficiary_estimate ?? "",
    activeProjectCount: region.active_project_count ?? "",
    focusAreasText: Array.isArray(region.focus_areas) ? region.focus_areas.join("\n") : "",
    categoriesText: Array.isArray(region.categories) ? region.categories.join("\n") : "",
    coverImageUrl: region.cover_image_url ?? "",
    sortOrder: region.sort_order ?? 0,
    isActive: region.is_active ?? true,
    visibility: region.visibility === "internal" ? "internal" : "public",
    relatedProjectSlugsText: stringArrayFromMetadata(metadata.relatedProjectSlugs),
    recentUpdatesText: recentUpdatesFromMetadata(metadata.recentUpdates)
  };
}

const visibilityOptions = [
  { label: "Public görünür", value: "public" },
  { label: "İç kayıt", value: "internal" }
];

export function ProjectRegionForm({
  action,
  region,
  submitLabel
}: {
  action: (formData: FormData) => void | Promise<void>;
  region?: AdminProjectRegion | null;
  submitLabel: string;
}) {
  const values = mapRegionToValues(region);

  return (
    <form action={action} className="grid gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminTextInput label="Bölge Adı" name="name" defaultValue={values.name} required />
        <AdminTextInput label="Slug" name="slug" defaultValue={values.slug} helper="Boş bırakılırsa bölge adından güvenli slug üretilebilir." />
        <AdminTextInput label="Ülke" name="country" defaultValue={values.country} />
        <AdminTextInput label="Çalışma Hattı / Bölge Etiketi" name="regionLabel" defaultValue={values.regionLabel} />
        <AdminTextInput label="Boylam (lng)" name="coordsLng" type="number" defaultValue={values.coordsLng} />
        <AdminTextInput label="Enlem (lat)" name="coordsLat" type="number" defaultValue={values.coordsLat} />
        <AdminTextInput label="Öncelik Etiketi" name="priorityLabel" defaultValue={values.priorityLabel} />
        <AdminTextInput label="Yararlanıcı Tahmini" name="beneficiaryEstimate" defaultValue={values.beneficiaryEstimate} />
        <AdminTextInput label="Aktif Proje Sayısı" name="activeProjectCount" type="number" defaultValue={values.activeProjectCount} />
        <AdminTextInput label="Sıra" name="sortOrder" type="number" defaultValue={values.sortOrder} />
        <AdminTextInput label="Kapak Görsel URL" name="coverImageUrl" type="url" defaultValue={values.coverImageUrl} placeholder="https://..." />
        <AdminSelect label="Görünürlük" name="visibility" defaultValue={values.visibility} options={visibilityOptions} />
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-border-soft bg-white px-4 py-3 text-sm font-bold text-dark-navy">
        <input name="isActive" type="checkbox" defaultChecked={values.isActive} className="mt-1 h-4 w-4 rounded border-border-soft text-ocean-green" />
        <span>
          Aktif bölge
          <span className="mt-1 block text-xs font-semibold leading-5 text-ink-muted">Pasif bölgeler public haritada görünmez.</span>
        </span>
      </label>

      <AdminTextInput label="Tagline" name="tagline" defaultValue={values.tagline} />
      <AdminTextarea label="Kısa Açıklama" name="shortDescription" defaultValue={values.shortDescription} rows={3} />
      <AdminTextarea label="Detay Açıklama" name="description" defaultValue={values.description} rows={5} />
      <AdminTextarea label="Çalışma Modeli" name="operatingModel" defaultValue={values.operatingModel} rows={3} />

      <div className="grid gap-4 md:grid-cols-2">
        <AdminTextarea label="Odak Alanları" name="focusAreasText" defaultValue={values.focusAreasText} rows={5} helper="Her satıra bir odak alanı yazın." />
        <AdminTextarea label="Kategori Anahtarları" name="categoriesText" defaultValue={values.categoriesText} rows={5} helper="food, water, health, shelter, orphan, education, qurban, emergency." />
        <AdminTextarea label="İlgili Proje Slugları" name="relatedProjectSlugsText" defaultValue={values.relatedProjectSlugsText} rows={5} helper="Fallback/yedek eşleşme için her satıra bir proje slugı." />
        <AdminTextarea
          label="Son Saha Güncellemeleri"
          name="recentUpdatesText"
          defaultValue={values.recentUpdatesText}
          rows={5}
          helper="Her satır: Başlık | Tarih etiketi | Kısa açıklama"
        />
      </div>

      <AdminFormActions cancelHref="/admin/proje-bolgeleri" submitLabel={submitLabel} />
    </form>
  );
}
