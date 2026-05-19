import { AdminFormActions } from "@/components/admin/AdminFormShell";
import { AdminSelect, AdminTextInput, AdminTextarea } from "@/components/admin/AdminFormFields";
import type { ReportFormValues } from "@/app/admin/faaliyet-raporlari/actions";

const statusOptions = [
  { label: "Taslak", value: "draft" },
  { label: "Yayında", value: "published" },
  { label: "Arşiv", value: "archived" }
];

const emptyReport: ReportFormValues = {
  title: "",
  slug: "",
  period: "",
  category: "Genel Faaliyet",
  summary: "",
  status: "draft",
  fileUrl: "",
  metricsText: "",
  publishedAt: ""
};

export function ReportForm({
  action,
  report,
  submitLabel
}: {
  action: (formData: FormData) => void | Promise<void>;
  report?: ReportFormValues | null;
  submitLabel: string;
}) {
  const values = report ?? emptyReport;

  return (
    <form action={action} className="grid gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminTextInput label="Rapor Başlığı" name="title" defaultValue={values.title} required />
        <AdminTextInput label="Slug" name="slug" defaultValue={values.slug} helper="Boş bırakılırsa başlıktan güvenli slug üretilebilir." />
        <AdminTextInput label="Dönem" name="period" defaultValue={values.period} />
        <AdminTextInput label="Kategori" name="category" defaultValue={values.category} />
        <AdminSelect label="Yayın Durumu" name="status" defaultValue={values.status} options={statusOptions} />
        <AdminTextInput label="Yayın Tarihi" name="publishedAt" type="date" defaultValue={values.publishedAt} />
      </div>
      <AdminTextarea label="Açıklama" name="summary" defaultValue={values.summary} required rows={5} />
      <AdminTextInput label="PDF / Dosya URL" name="fileUrl" type="url" defaultValue={values.fileUrl} placeholder="https://..." helper="Bu aşamada dosya upload yoktur; varsa güvenli public URL manuel girilir." />
      <AdminTextarea label="Metrikler" name="metricsText" defaultValue={values.metricsText} rows={6} helper="Her satır: Etiket: Değer veya JSON label/value listesi." />
      <AdminFormActions cancelHref="/admin/faaliyet-raporlari" submitLabel={submitLabel} />
    </form>
  );
}
