"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/FormField";
import { FormProtectionFields } from "@/components/forms/FormProtectionFields";
import { LegalConsentFields } from "@/components/forms/LegalConsent";
import type { TurnstilePublicConfig } from "@/lib/security/turnstilePublic";

type ContactFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  formNotice?: string;
  formError?: string;
  turnstile?: TurnstilePublicConfig;
};

export function ContactForm({ action, formNotice, formError, turnstile }: ContactFormProps) {
  return (
    <form action={action} className="self-start rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
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
        <TextField label="Konu" name="subject" className="sm:col-span-2" required maxLength={160} />
        <TextAreaField label="Mesaj" name="message" required className="sm:col-span-2" rows={4} maxLength={1500} />
      </div>
      <div className="mt-6 grid gap-3">
        <LegalConsentFields context="contact" showCommunicationPermission />
      </div>
      <FormProtectionFields turnstile={turnstile} />
      <Button type="submit" className="mt-7 w-full" showIcon>
        Mesaj Gönder
      </Button>
    </form>
  );
}
