import { AdminFormActions } from "@/components/admin/AdminFormShell";
import {
  manualReceiptDonationTypeLabels,
  manualReceiptOutputTypeLabels,
  manualReceiptPaymentMethodLabels,
  type ManualReceipt
} from "@/data/manualReceiptMock";

type ManualReceiptFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  receipt?: ManualReceipt | null;
  submitLabel: string;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm font-bold text-dark-navy">
      {label}
      {children}
    </label>
  );
}

const inputClassName = "focus-ring mt-2 w-full rounded-lg border border-border-soft px-3 py-2 text-sm text-dark-navy";

function dateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return date.toISOString().slice(0, 16);
}

export function ManualReceiptForm({ action, receipt, submitLabel }: ManualReceiptFormProps) {
  return (
    <form action={action} className="grid gap-6">
      {receipt ? <input type="hidden" name="id" value={receipt.id} /> : null}

      <section className="grid gap-3">
        <h2 className="border-b border-border-soft pb-2 text-base font-black text-dark-navy">Makbuz Bilgileri</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="Seri No">
            <input name="serialNo" defaultValue={receipt?.serialNo ?? ""} className={inputClassName} />
          </Field>
          <Field label="Sıra No">
            <input name="sequenceNo" type="number" defaultValue={receipt?.sequenceNo ?? ""} className={inputClassName} />
          </Field>
          <Field label="Koçan No">
            <input name="bookletNo" defaultValue={receipt?.bookletNo ?? ""} className={inputClassName} />
          </Field>
          <Field label="Çıktı Türü">
            <select name="outputType" defaultValue={receipt?.outputType ?? "a4_landscape"} className={inputClassName}>
              {Object.entries(manualReceiptOutputTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tarih / Saat">
            <input name="receiptDate" type="datetime-local" required defaultValue={dateTimeLocal(receipt?.receiptDate)} className={inputClassName} />
          </Field>
          <Field label="Şube">
            <input name="branchName" defaultValue={receipt?.branchName ?? ""} className={inputClassName} />
          </Field>
          <Field label="Birim">
            <input name="unitName" defaultValue={receipt?.unitName ?? ""} className={inputClassName} />
          </Field>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="border-b border-border-soft pb-2 text-base font-black text-dark-navy">Bağışçı Bilgileri</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Bağışçı türü">
            <select name="donorType" defaultValue={receipt?.donorType ?? "individual"} className={inputClassName}>
              <option value="individual">Bireysel</option>
              <option value="corporate">Kurumsal</option>
              <option value="anonymous">Anonim</option>
            </select>
          </Field>
          <Field label="Ad Soyad / Kurum Adı">
            <input name="donorName" required defaultValue={receipt?.donorName ?? ""} className={inputClassName} />
          </Field>
          <Field label="Telefon">
            <input name="donorPhone" defaultValue={receipt?.donorPhone ?? ""} className={inputClassName} />
          </Field>
          <Field label="E-posta">
            <input name="donorEmail" type="email" defaultValue={receipt?.donorEmail ?? ""} className={inputClassName} />
          </Field>
          <Field label="Vergi/TCKN">
            <input name="donorTaxId" defaultValue="" className={inputClassName} />
          </Field>
          <Field label="Adres">
            <input name="donorAddress" defaultValue={receipt?.donorAddress ?? ""} className={inputClassName} />
          </Field>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="border-b border-border-soft pb-2 text-base font-black text-dark-navy">Bağış Bilgileri</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Bağış türü">
            <select name="donationType" required defaultValue={receipt?.donationType ?? "general_donation"} className={inputClassName}>
              {Object.entries(manualReceiptDonationTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Kampanya">
            <input name="campaignName" defaultValue={receipt?.campaignName ?? ""} className={inputClassName} />
          </Field>
          <Field label="Proje">
            <input name="projectName" defaultValue={receipt?.projectName ?? ""} className={inputClassName} />
          </Field>
          <Field label="Tutar">
            <input name="amount" type="number" step="0.01" min="0.01" required defaultValue={receipt?.amount ?? ""} className={inputClassName} />
          </Field>
          <Field label="Para birimi">
            <input name="currency" required defaultValue={receipt?.currency ?? "TRY"} className={inputClassName} />
          </Field>
          <Field label="Ödeme yöntemi">
            <select name="paymentMethod" required defaultValue={receipt?.paymentMethod ?? "cash"} className={inputClassName}>
              {Object.entries(manualReceiptPaymentMethodLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tutar yazıyla">
            <input name="amountInWords" defaultValue={receipt?.amountInWords ?? ""} className={inputClassName} />
          </Field>
          <Field label="Bağışın amacı">
            <input name="purpose" defaultValue={receipt?.purpose ?? ""} className={inputClassName} />
          </Field>
          <Field label="Açıklama">
            <input name="description" defaultValue={receipt?.description ?? ""} className={inputClassName} />
          </Field>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="border-b border-border-soft pb-2 text-base font-black text-dark-navy">Görevli / Onay Bilgileri</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Tahsilatı yapan">
            <input name="collectorName" defaultValue={receipt?.collectorName ?? ""} className={inputClassName} />
          </Field>
          <Field label="Muhasebe / Yetkili">
            <input name="accountingOfficerName" defaultValue={receipt?.accountingOfficerName ?? ""} className={inputClassName} />
          </Field>
          <Field label="Onaylayan">
            <input name="approvedByName" defaultValue={receipt?.approvedByName ?? ""} className={inputClassName} />
          </Field>
        </div>
      </section>

      <AdminFormActions cancelHref="/admin/makbuzlar/manuel" submitLabel={submitLabel} />
    </form>
  );
}
