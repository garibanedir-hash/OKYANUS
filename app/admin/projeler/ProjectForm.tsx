"use client";

import { useState } from "react";
import { AdminFormActions } from "@/components/admin/AdminFormShell";
import { AdminSelect, AdminTextInput, AdminTextarea } from "@/components/admin/AdminFormFields";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { ProjectFormValues } from "@/app/admin/projeler/actions";

const projectStatusOptions = [
  { label: "Taslak", value: "draft" },
  { label: "Yayında", value: "active" },
  { label: "Tamamlandı", value: "completed" },
  { label: "Arşiv", value: "archived" }
];

const categoryOptions = [
  { label: "Gıda", value: "Gıda" },
  { label: "Eğitim", value: "Eğitim" },
  { label: "Sağlık", value: "Sağlık" },
  { label: "Acil Yardım", value: "Acil Yardım" },
  { label: "Yetim", value: "Yetim" },
  { label: "Genel", value: "Genel" }
];

const emptyProject: ProjectFormValues = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  category: "Gıda",
  status: "draft",
  location: "",
  goal: 0,
  raised: 0,
  startDate: "",
  transparencyNote: "",
  regionSlug: "",
  country: "",
  city: "",
  regionLabel: "",
  coverImageUrl: "",
  thumbnailUrl: "",
  metricsText: "",
  impactItemsText: "",
  scopeItemsText: "",
  ctaLabel: "Projeye Destek Ol",
  ctaHref: ""
};

type RegionOption = {
  label: string;
  value: string;
  country?: string | null;
  city?: string | null;
  regionLabel?: string | null;
};

const textInputClassName = "focus-ring mt-2 w-full rounded-lg border border-border-soft px-3 py-2 text-sm text-dark-navy";

export function ProjectForm({
  action,
  project,
  regionOptions = [],
  submitLabel
}: {
  action: (formData: FormData) => void | Promise<void>;
  project?: ProjectFormValues | null;
  regionOptions?: RegionOption[];
  submitLabel: string;
}) {
  const values = project ?? emptyProject;
  const [regionSlug, setRegionSlug] = useState(values.regionSlug);
  const [country, setCountry] = useState(values.country);
  const [city, setCity] = useState(values.city);
  const [regionLabel, setRegionLabel] = useState(values.regionLabel);
  const regionSelectOptions = [
    { label: "Bölge seçilmedi", value: "" },
    ...regionOptions
  ];

  return (
    <form action={action} encType="multipart/form-data" className="grid gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminTextInput label="Proje Başlığı" name="title" defaultValue={values.title} required />
        <AdminTextInput label="Slug" name="slug" defaultValue={values.slug} helper="Boş bırakılırsa başlıktan güvenli slug üretilebilir." />
        <AdminSelect label="Kategori" name="category" defaultValue={values.category} options={categoryOptions} />
        <AdminSelect label="Yayın Durumu" name="status" defaultValue={values.status} options={projectStatusOptions} />
        <label className="text-sm font-bold text-dark-navy">
          Çalışma Bölgesi
          <select
            name="regionSlug"
            value={regionSlug}
            onChange={(event) => {
              const selected = regionOptions.find((option) => option.value === event.currentTarget.value);
              setRegionSlug(event.currentTarget.value);
              if (selected) {
                setCountry(selected.country ?? "");
                setCity(selected.city ?? selected.regionLabel ?? "");
                setRegionLabel(selected.regionLabel ?? selected.city ?? "");
              }
            }}
            className={textInputClassName}
          >
            {regionSelectOptions.map((option) => (
              <option key={option.value || "empty"} value={option.value}>{option.label}</option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-semibold leading-5 text-ink-muted">Harita ve bölge filtreleri bu bağlantıyı kullanır.</span>
        </label>
        <AdminTextInput label="Lokasyon" name="location" defaultValue={values.location} />
        <label className="text-sm font-bold text-dark-navy">
          Ülke
          <input name="country" value={country} onChange={(event) => setCountry(event.currentTarget.value)} className={textInputClassName} />
        </label>
        <label className="text-sm font-bold text-dark-navy">
          Şehir
          <input name="city" value={city} onChange={(event) => setCity(event.currentTarget.value)} className={textInputClassName} />
        </label>
        <label className="text-sm font-bold text-dark-navy">
          Bölge Etiketi
          <input name="regionLabel" value={regionLabel} onChange={(event) => setRegionLabel(event.currentTarget.value)} className={textInputClassName} />
        </label>
        <ImageUploadField
          label="Kapak Görseli"
          fileName="coverImageFile"
          urlName="coverImageUrl"
          defaultUrl={values.coverImageUrl}
          helper="Proje detay sayfası ve büyük kartlarda kullanılır."
        />
        <ImageUploadField
          label="Kart Görseli / Thumbnail"
          fileName="thumbnailImageFile"
          urlName="thumbnailUrl"
          defaultUrl={values.thumbnailUrl}
          helper="Proje kartındaki görsel alanında öncelikli kullanılır. Boşsa kapak görseli kullanılır."
        />
        <AdminTextInput label="Başlangıç Tarihi" name="startDate" type="date" defaultValue={values.startDate} />
        <AdminTextInput label="Hedef Destek" name="goal" type="number" defaultValue={values.goal} />
        <AdminTextInput label="Ulaşılan Destek" name="raised" type="number" defaultValue={values.raised} />
      </div>
      <AdminTextarea label="Kısa Özet" name="summary" defaultValue={values.summary} required rows={3} />
      <AdminTextarea label="Detay / Açıklama" name="description" defaultValue={values.description} required rows={7} />
      <div className="grid gap-4 md:grid-cols-2">
        <AdminTextarea label="Metrikler" name="metricsText" defaultValue={values.metricsText} rows={5} helper="Her satır: Etiket: Değer veya JSON label/value listesi." />
        <AdminTextarea label="Etki Maddeleri" name="impactItemsText" defaultValue={values.impactItemsText} rows={5} helper="Her satıra bir madde yazın." />
        <AdminTextarea label="Kapsam Maddeleri" name="scopeItemsText" defaultValue={values.scopeItemsText} rows={5} helper="Her satıra bir süreç maddesi yazın." />
        <AdminTextarea label="Şeffaflık Notu" name="transparencyNote" defaultValue={values.transparencyNote} rows={5} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminTextInput label="CTA Etiketi" name="ctaLabel" defaultValue={values.ctaLabel} />
        <AdminTextInput label="CTA Linki" name="ctaHref" type="url" defaultValue={values.ctaHref} placeholder="https://..." />
      </div>
      <AdminFormActions cancelHref="/admin/projeler" submitLabel={submitLabel} />
    </form>
  );
}
