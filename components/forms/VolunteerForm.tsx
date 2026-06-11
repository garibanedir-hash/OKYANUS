"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/FormField";
import { ConsentCheckbox, LegalTextLink, legalLinks } from "@/components/forms/LegalConsent";

const interests = [
  "Saha Faaliyetleri",
  "Eğitim Desteği",
  "Lojistik Destek",
  "Sosyal Medya / Tasarım",
  "Organizasyon Desteği",
  "İletişim ve Bağışçı İlişkileri"
];

export function VolunteerForm() {
  const [success, setSuccess] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSuccess(true);
      }}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8"
    >
      {success ? (
        <div className="mb-6 flex gap-3 rounded-2xl bg-mint-green p-4 text-ocean-green">
          <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5" />
          <p className="text-sm font-semibold">
            Başvurunuz bize ulaştı. En kısa sürede sizinle iletişime geçerek iyilik yolculuğundaki uygun alanı birlikte değerlendireceğiz.
          </p>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Ad Soyad" required />
        <TextField label="E-posta" type="email" required />
        <TextField label="Telefon" type="tel" />
        <TextField label="Yaş" type="number" />
        <TextField label="Şehir" />
        <SelectField label="İlgi Alanı">
          {interests.map((interest) => (
            <option key={interest}>{interest}</option>
          ))}
        </SelectField>
        <TextAreaField label="Daha önce gönüllülük deneyimi" className="sm:col-span-2" rows={3} />
        <TextAreaField label="Mesaj" className="sm:col-span-2" placeholder="Kısaca kendinizden ve destek olmak istediğiniz alandan bahsedebilirsiniz." />
      </div>
      <div className="mt-6 grid gap-3">
        <ConsentCheckbox name="volunteerKvkkAccepted" required>
          <LegalTextLink href={legalLinks.volunteerNotice}>Gönüllü Başvuru Aydınlatma Metni</LegalTextLink>&apos;ni okudum.
        </ConsentCheckbox>
        <ConsentCheckbox name="volunteerExplicitConsent">
          <LegalTextLink href={legalLinks.explicitConsent}>Açık Rıza Metni</LegalTextLink> kapsamında gönüllülük başvurumun
          değerlendirilmesi ve uygun gönüllülük alanları için benimle iletişim kurulmasını kabul ediyorum.
        </ConsentCheckbox>
        <ConsentCheckbox name="volunteerAnnouncementPermission">
          Faaliyet ve bilgilendirme duyurularının tarafıma iletilmesini kabul ediyorum.
        </ConsentCheckbox>
      </div>
      <Button type="submit" className="mt-7 w-full" showIcon>
        Başvuruyu Gönder
      </Button>
    </form>
  );
}
