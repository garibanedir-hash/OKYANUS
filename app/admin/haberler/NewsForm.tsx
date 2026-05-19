import { AdminFormActions } from "@/components/admin/AdminFormShell";
import { AdminSelect, AdminTextInput, AdminTextarea } from "@/components/admin/AdminFormFields";
import type { NewsFormValues } from "@/app/admin/haberler/actions";

const statusOptions = [
  { label: "Taslak", value: "draft" },
  { label: "Yayında", value: "published" },
  { label: "Arşiv", value: "archived" }
];

const emptyNews: NewsFormValues = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  category: "Duyuru",
  status: "draft",
  publishedAt: "",
  tagsText: "",
  relatedProjectSlug: "",
  relatedActivitySlug: "",
  coverImageUrl: ""
};

export function NewsForm({
  action,
  news,
  submitLabel
}: {
  action: (formData: FormData) => void | Promise<void>;
  news?: NewsFormValues | null;
  submitLabel: string;
}) {
  const values = news ?? emptyNews;

  return (
    <form action={action} className="grid gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminTextInput label="Haber Başlığı" name="title" defaultValue={values.title} required />
        <AdminTextInput label="Slug" name="slug" defaultValue={values.slug} helper="Boş bırakılırsa başlıktan güvenli slug üretilebilir." />
        <AdminTextInput label="Kategori" name="category" defaultValue={values.category} />
        <AdminSelect label="Yayın Durumu" name="status" defaultValue={values.status} options={statusOptions} />
        <AdminTextInput label="Yayın Tarihi" name="publishedAt" type="date" defaultValue={values.publishedAt} />
        <AdminTextInput label="Kapak Görsel URL" name="coverImageUrl" type="url" defaultValue={values.coverImageUrl} placeholder="https://..." />
      </div>
      <AdminTextarea label="Özet" name="summary" defaultValue={values.summary} required rows={3} />
      <AdminTextarea label="İçerik" name="content" defaultValue={values.content} required rows={10} />
      <div className="grid gap-4 md:grid-cols-3">
        <AdminTextarea label="Etiketler" name="tagsText" defaultValue={values.tagsText} rows={4} helper="Virgül veya satırla ayırın." />
        <AdminTextInput label="İlgili Proje Slug" name="relatedProjectSlug" defaultValue={values.relatedProjectSlug} />
        <AdminTextInput label="İlgili Faaliyet Slug" name="relatedActivitySlug" defaultValue={values.relatedActivitySlug} />
      </div>
      <AdminFormActions cancelHref="/admin/haberler" submitLabel={submitLabel} />
    </form>
  );
}
