"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/FormField";

export function ContactForm() {
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
            Mesajınız bize ulaştı. İlgili ekibimiz talebinizi inceleyip en kısa sürede sizinle iletişime geçecektir.
          </p>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Ad Soyad" required />
        <TextField label="E-posta" type="email" required />
        <TextField label="Konu" className="sm:col-span-2" required />
        <TextAreaField label="Mesaj" required className="sm:col-span-2" rows={5} />
      </div>
      <Button type="submit" className="mt-7 w-full" showIcon>
        Mesaj Gönder
      </Button>
    </form>
  );
}
