"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/FormField";
import { LegalConsentFields } from "@/components/forms/LegalConsent";

const interests = [
  "Saha Faaliyetleri",
  "Eğitim Desteği",
  "Lojistik Destek",
  "Sosyal Medya / Tasarım",
  "Organizasyon Desteği",
  "İletişim ve Bağışçı İlişkileri"
];

type VolunteerFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  formNotice?: string;
  formError?: string;
};

export function VolunteerForm({ action, formNotice, formError }: VolunteerFormProps) {
  return (
    <form action={action} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      {formNotice ? (
        <div className="mb-6 flex gap-3 rounded-2xl bg-mint-green p-4 text-ocean-green">
          <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5" />
          <p className="text-sm font-semibold">{formNotice}</p>
        </div>
      ) : null}
      {formError ? (
        <div className="mb-6 flex gap-3 rounded-2xl bg-warm-accent/10 p-4 text-dark-navy">
          <AlertCircle aria-hidden className="mt-0.5 h-5 w-5 text-warm-accent" />
          <p className="text-sm font-semibold">{formError}</p>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Ad Soyad" name="fullName" required autoComplete="name" maxLength={120} />
        <TextField label="E-posta" name="email" type="email" required autoComplete="email" maxLength={160} />
        <TextField label="Telefon" name="phone" type="tel" autoComplete="tel" maxLength={30} />
        <TextField label="Yaş" name="age" type="number" min={16} max={100} />
        <TextField label="Şehir" name="city" maxLength={80} />
        <SelectField label="İlgi Alanı" name="interestArea" required>
          <option value="">Seçiniz</option>
          {interests.map((interest) => (
            <option key={interest}>{interest}</option>
          ))}
        </SelectField>
        <TextAreaField label="Daha önce gönüllülük deneyimi" name="experience" className="sm:col-span-2" rows={3} maxLength={1000} />
        <TextAreaField
          label="Mesaj"
          name="note"
          className="sm:col-span-2"
          placeholder="Kısaca kendinizden ve destek olmak istediğiniz alandan bahsedebilirsiniz."
          maxLength={1000}
        />
      </div>
      <div className="mt-6 grid gap-3">
        <LegalConsentFields context="volunteer" requireExplicitConsent showCommunicationPermission />
      </div>
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Button type="submit" className="mt-7 w-full" showIcon>
        Başvuruyu Gönder
      </Button>
    </form>
  );
}
