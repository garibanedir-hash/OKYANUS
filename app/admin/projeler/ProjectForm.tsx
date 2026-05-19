import { AdminFormActions } from "@/components/admin/AdminFormShell";
import { AdminSelect, AdminTextInput, AdminTextarea } from "@/components/admin/AdminFormFields";
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
  metricsText: "",
  impactItemsText: "",
  scopeItemsText: "",
  ctaLabel: "Projeye Destek Ol",
  ctaHref: ""
};

export function ProjectForm({
  action,
  project,
  submitLabel
}: {
  action: (formData: FormData) => void | Promise<void>;
  project?: ProjectFormValues | null;
  submitLabel: string;
}) {
  const values = project ?? emptyProject;

  return (
    <form action={action} className="grid gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminTextInput label="Proje Başlığı" name="title" defaultValue={values.title} required />
        <AdminTextInput label="Slug" name="slug" defaultValue={values.slug} helper="Boş bırakılırsa başlıktan güvenli slug üretilebilir." />
        <AdminSelect label="Kategori" name="category" defaultValue={values.category} options={categoryOptions} />
        <AdminSelect label="Yayın Durumu" name="status" defaultValue={values.status} options={projectStatusOptions} />
        <AdminTextInput label="Lokasyon" name="location" defaultValue={values.location} />
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
