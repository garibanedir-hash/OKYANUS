import { AdminSelect, AdminTextInput, AdminTextarea } from "@/components/admin/AdminFormFields";
import { AdminFormActions } from "@/components/admin/AdminFormShell";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  projectActivityStatusLabels,
  projectActivityTypeLabels,
  projectActivityVisibilityLabels,
  type ProjectActivity
} from "@/data/projectActivityMock";

type ProjectActivityFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  projectId: string;
  activity?: ProjectActivity | null;
  submitLabel: string;
  cancelHref: string;
};

const activityTypeOptions = Object.entries(projectActivityTypeLabels).map(([value, label]) => ({ value, label }));
const statusOptions = Object.entries(projectActivityStatusLabels).map(([value, label]) => ({ value, label }));
const visibilityOptions = Object.entries(projectActivityVisibilityLabels).map(([value, label]) => ({ value, label }));

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toLines(values?: string[]) {
  return values?.length ? values.join("\n") : "";
}

function DateTimeInput({
  label,
  name,
  defaultValue,
  helper
}: {
  label: string;
  name: string;
  defaultValue?: string;
  helper?: string;
}) {
  return (
    <label className="text-sm font-bold text-dark-navy">
      {label}
      <input
        name={name}
        type="datetime-local"
        defaultValue={toDateTimeLocal(defaultValue)}
        className="focus-ring mt-2 w-full rounded-lg border border-border-soft px-3 py-2 text-sm text-dark-navy"
      />
      {helper ? <span className="mt-1 block text-xs font-semibold leading-5 text-ink-muted">{helper}</span> : null}
    </label>
  );
}

export function ProjectActivityForm({ action, projectId, activity, submitLabel, cancelHref }: ProjectActivityFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="projectId" value={projectId} />
      {activity?.id ? <input type="hidden" name="activityId" value={activity.id} /> : null}

      <section className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <AdminTextInput label="Başlık" name="title" defaultValue={activity?.title} required />
          <AdminTextInput label="Slug" name="slug" defaultValue={activity?.slug} helper="Boş bırakılırsa başlıktan güvenli slug üretilir." />
          <AdminSelect label="Faaliyet Türü" name="activityType" defaultValue={activity?.activityType ?? "field_visit"} options={activityTypeOptions} />
          <AdminSelect label="Durum" name="status" defaultValue={activity?.status ?? "draft"} options={statusOptions} />
          <AdminSelect label="Görünürlük" name="visibility" defaultValue={activity?.visibility ?? "internal"} options={visibilityOptions} />
          <AdminTextInput label="Faaliyet Tarihi" name="activityDate" type="date" defaultValue={activity?.activityDate} />
          <DateTimeInput label="Başlangıç Zamanı" name="startTime" defaultValue={activity?.startTime} />
          <DateTimeInput label="Bitiş Zamanı" name="endTime" defaultValue={activity?.endTime} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <AdminTextInput label="Ülke" name="country" defaultValue={activity?.country ?? "Türkiye"} />
        <AdminTextInput label="Şehir" name="city" defaultValue={activity?.city} />
        <AdminTextInput label="İlçe" name="district" defaultValue={activity?.district} />
        <AdminTextInput label="Lokasyon Adı" name="locationName" defaultValue={activity?.locationName} />
        <AdminTextInput label="Bölge Etiketi" name="regionLabel" defaultValue={activity?.regionLabel} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <AdminTextInput label="Sorumlu Kişi" name="responsiblePerson" defaultValue={activity?.responsiblePerson} />
        <AdminTextInput label="Ekip Adı" name="teamName" defaultValue={activity?.teamName} />
        <AdminTextInput label="Yararlanıcı Sayısı" name="beneficiaryCount" type="number" defaultValue={activity?.beneficiaryCount} />
        <AdminTextInput label="Aile Sayısı" name="familyCount" type="number" defaultValue={activity?.familyCount} />
        <AdminTextInput label="Dağıtılan Yardım Türü" name="distributedItemType" defaultValue={activity?.distributedItemType} />
        <AdminTextInput label="Dağıtılan Adet" name="distributedItemCount" type="number" defaultValue={activity?.distributedItemCount} />
        <AdminTextInput label="Tahmini Maliyet" name="estimatedCost" type="number" defaultValue={activity?.estimatedCost} />
        <AdminTextInput label="Para Birimi" name="currency" defaultValue={activity?.currency ?? "TRY"} />
      </section>

      <section className="grid gap-4">
        <AdminTextarea label="Kısa Özet" name="summary" defaultValue={activity?.summary} rows={3} />
        <AdminTextarea label="Detaylı Açıklama" name="description" defaultValue={activity?.description} rows={6} />
        <AdminTextarea label="Public Özet" name="publicSummary" defaultValue={activity?.publicSummary} rows={3} helper="Public görünür kayıtlar için proje sayfasında bu metin kullanılır." />
        <AdminTextarea label="İç Notlar" name="internalNotes" defaultValue={activity?.internalNotes} rows={4} helper="Public sayfada gösterilmez." />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ImageUploadField
          label="Kapak Görseli"
          fileName="coverImageFile"
          urlName="coverImageUrl"
          defaultUrl={activity?.coverImageUrl}
          helper="Public faaliyet kartlarında ve proje haritası alt alanında kullanılabilir."
        />
        <AdminTextInput label="Video URL" name="videoUrl" type="url" defaultValue={activity?.videoUrl} placeholder="https://..." />
        <AdminTextInput label="Rapor URL" name="reportUrl" type="url" defaultValue={activity?.reportUrl} placeholder="https://..." />
        <AdminTextarea label="Galeri URL'leri" name="galleryUrls" defaultValue={toLines(activity?.galleryUrls)} rows={4} helper="Her satıra bir URL yazın." />
      </section>

      <AdminFormActions cancelHref={cancelHref} submitLabel={submitLabel} />
    </form>
  );
}
