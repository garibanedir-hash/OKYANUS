"use client";

import { useMemo, useState } from "react";
import { AdminFormActions } from "@/components/admin/AdminFormShell";
import { AdminSelect, AdminTextInput, AdminTextarea } from "@/components/admin/AdminFormFields";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  countryOptions,
  findCityByCoordinates,
  findCityById,
  findCityByName,
  findCountryByName,
  getCountryByCode,
  searchCitiesForCountry,
  searchCountries
} from "@/data/geo/worldLocations";
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

const selectClassName = "focus-ring mt-2 w-full rounded-lg border border-border-soft px-3 py-2 text-sm text-dark-navy";
const textInputClassName = "focus-ring mt-2 w-full rounded-lg border border-border-soft px-3 py-2 text-sm text-dark-navy";
const customCityId = "__custom_city__";

function stringValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

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
  const initialCountry = findCountryByName(values.country) ?? getCountryByCode("TR") ?? countryOptions[0];
  const initialCity =
    findCityByCoordinates(initialCountry.code, values.coordsLat, values.coordsLng) ??
    findCityByName(initialCountry.code, values.regionLabel);
  const hasInitialCustomCity = Boolean(values.regionLabel && !initialCity);
  const [countryCode, setCountryCode] = useState(initialCountry.code);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [cityId, setCityId] = useState(initialCity?.id ?? (hasInitialCustomCity ? customCityId : ""));
  const [customCityName, setCustomCityName] = useState(hasInitialCustomCity ? values.regionLabel : "");
  const [manualLat, setManualLat] = useState(hasInitialCustomCity ? stringValue(values.coordsLat) : "");
  const [manualLng, setManualLng] = useState(hasInitialCustomCity ? stringValue(values.coordsLng) : "");
  const selectedCountry = getCountryByCode(countryCode) ?? countryOptions[0];
  const countries = useMemo(() => {
    const matches = searchCountries(countryQuery);
    return matches.some((country) => country.code === countryCode) ? matches : [selectedCountry, ...matches];
  }, [countryCode, countryQuery, selectedCountry]);
  const cities = useMemo(() => searchCitiesForCountry(countryCode, cityQuery), [countryCode, cityQuery]);
  const selectedCity = cityId === customCityId ? undefined : findCityById(cityId);
  const isCustomCity = cityId === customCityId;
  const locationCityName = selectedCity?.name ?? customCityName.trim();
  const coordinateLat = manualLat.trim() || selectedCity?.lat || selectedCountry.defaultLat;
  const coordinateLng = manualLng.trim() || selectedCity?.lng || selectedCountry.defaultLng;

  return (
    <form action={action} encType="multipart/form-data" className="grid gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <input type="hidden" name="country" value={selectedCountry.name} />
      <input type="hidden" name="locationCityName" value={locationCityName} />
      <input type="hidden" name="coordsLng" value={coordinateLng} />
      <input type="hidden" name="coordsLat" value={coordinateLat} />
      <div className="grid gap-4 md:grid-cols-2">
        <AdminTextInput label="Bölge Adı" name="name" defaultValue={values.name} required />
        <AdminTextInput label="Slug" name="slug" defaultValue={values.slug} helper="Boş bırakılırsa bölge adından güvenli slug üretilebilir." />
        <div className="grid gap-2">
          <label className="text-sm font-bold text-dark-navy" htmlFor="countrySearch">Ülke ara</label>
          <input
            id="countrySearch"
            type="search"
            value={countryQuery}
            onChange={(event) => setCountryQuery(event.currentTarget.value)}
            placeholder="Ülke adı yazın"
            className={textInputClassName}
          />
          <label className="text-sm font-bold text-dark-navy">
            Ülke
            <select
              name="countryCode"
              value={countryCode}
              onChange={(event) => {
                setCountryCode(event.currentTarget.value);
                setCityId("");
                setCityQuery("");
                setCustomCityName("");
                setManualLat("");
                setManualLng("");
              }}
              className={selectClassName}
              required
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs font-semibold leading-5 text-ink-muted">Harita konumu için ülkeyi seçin.</span>
          </label>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-bold text-dark-navy" htmlFor="citySearch">Şehir / bölge ara</label>
          <input
            id="citySearch"
            type="search"
            value={cityQuery}
            onChange={(event) => setCityQuery(event.currentTarget.value)}
            placeholder="Şehir veya bölge adı yazın"
            className={textInputClassName}
          />
          <label className="text-sm font-bold text-dark-navy">
            Şehir / Bölge
            <select
              name="locationCityId"
              value={cityId}
              onChange={(event) => {
                setCityId(event.currentTarget.value);
                setManualLat("");
                setManualLng("");
              }}
              className={selectClassName}
              required
            >
              <option value="">Şehir veya bölge seçin</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}{city.adminName ? ` · ${city.adminName}` : ""}
                </option>
              ))}
              <option value={customCityId}>Listede yok / özel şehir-bölge gir</option>
            </select>
            <span className="mt-1 block text-xs font-semibold leading-5 text-ink-muted">Seçilen kayıt harita işaretinin konumunu otomatik belirler.</span>
          </label>
        </div>
        {isCustomCity ? (
          <label className="text-sm font-bold text-dark-navy">
            Özel Şehir / Bölge Adı
            <input
              name="customCityName"
              value={customCityName}
              onChange={(event) => setCustomCityName(event.currentTarget.value)}
              placeholder="Örn. Darfur saha hattı"
              className={textInputClassName}
              required
            />
            <span className="mt-1 block text-xs font-semibold leading-5 text-ink-muted">
              Listede olmayan şehir, kamp, saha hattı veya özel bölge adını yazın.
            </span>
          </label>
        ) : null}
        <AdminTextInput label="Çalışma Hattı / Bölge Etiketi" name="regionLabel" defaultValue={values.regionLabel} />
        <div className="rounded-lg border border-border-soft bg-soft-gray px-4 py-3 text-sm">
          <p className="font-bold text-dark-navy">Harita konumu</p>
          <p className="mt-1 font-semibold leading-5 text-ink-muted">
            {selectedCity
              ? `${selectedCity.name}, ${selectedCountry.name} · ${selectedCity.lat.toFixed(4)}, ${selectedCity.lng.toFixed(4)}`
              : isCustomCity && customCityName.trim()
                ? `${customCityName.trim()}, ${selectedCountry.name} · ${Number(coordinateLat).toFixed(4)}, ${Number(coordinateLng).toFixed(4)}`
                : "Şehir seçildiğinde konum otomatik doldurulur."}
          </p>
          {isCustomCity ? (
            <p className="mt-2 text-xs font-semibold leading-5 text-ink-muted">
              Bu şehir için kesin koordinat bulunmadı. Harita konumu ülke merkezine yakın gösterilebilir; gerekirse gelişmiş alandan güncelleyebilirsiniz.
            </p>
          ) : null}
        </div>
        {isCustomCity ? (
          <details className="rounded-lg border border-border-soft bg-white p-4 md:col-span-2">
            <summary className="cursor-pointer text-sm font-bold text-dark-navy">Gelişmiş harita konumu</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold text-dark-navy">
                Yaklaşık enlem
                <input
                  type="number"
                  step="0.000001"
                  min="-90"
                  max="90"
                  value={manualLat}
                  onChange={(event) => setManualLat(event.currentTarget.value)}
                  placeholder={String(selectedCountry.defaultLat)}
                  className={textInputClassName}
                />
              </label>
              <label className="text-sm font-bold text-dark-navy">
                Yaklaşık boylam
                <input
                  type="number"
                  step="0.000001"
                  min="-180"
                  max="180"
                  value={manualLng}
                  onChange={(event) => setManualLng(event.currentTarget.value)}
                  placeholder={String(selectedCountry.defaultLng)}
                  className={textInputClassName}
                />
              </label>
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-ink-muted">
              Boş bırakılırsa seçilen ülkenin merkez konumu kullanılır. Admin ana akışta koordinat yazmak zorunda değildir.
            </p>
          </details>
        ) : null}
        <AdminTextInput label="Öncelik Etiketi" name="priorityLabel" defaultValue={values.priorityLabel} />
        <AdminTextInput label="Yararlanıcı Tahmini" name="beneficiaryEstimate" defaultValue={values.beneficiaryEstimate} />
        <AdminTextInput label="Aktif Proje Sayısı" name="activeProjectCount" type="number" defaultValue={values.activeProjectCount} />
        <AdminTextInput label="Sıra" name="sortOrder" type="number" defaultValue={values.sortOrder} />
        <ImageUploadField
          label="Bölge Kapak Görseli"
          fileName="coverImageFile"
          urlName="coverImageUrl"
          defaultUrl={values.coverImageUrl}
          helper="Bu görsel bölge detay kartlarında ve proje haritası bilgi alanlarında kullanılabilir."
          fallbackLabel="Bölge görseli önizlemesi"
        />
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
