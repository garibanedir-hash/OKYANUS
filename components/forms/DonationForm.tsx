"use client";

import { useState } from "react";
import { AlertCircle, BookOpen, CheckCircle2, HeartHandshake, Package, ShieldCheck, Utensils } from "lucide-react";
import { projects } from "@/data/projects";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/FormField";
import { ConsentCheckbox, LegalTextLink, legalLinks } from "@/components/forms/LegalConsent";
import { cn } from "@/lib/utils";

const amounts = [
  { value: 100, impact: "Bir öğrencinin kırtasiye desteğine katkı" },
  { value: 250, impact: "Bir ailenin temel ihtiyaç desteğine katkı" },
  { value: 500, impact: "Gıda kolisi desteğine katkı" },
  { value: 1000, impact: "Kapsamlı aile destek paketine katkı" }
];

const donationTypes = [
  { label: "Genel Bağış", icon: HeartHandshake },
  { label: "Gıda Desteği", icon: Utensils },
  { label: "Eğitim Desteği", icon: BookOpen },
  { label: "Yetim ve Aile Destekleri", icon: ShieldCheck },
  { label: "Acil Yardım", icon: Package },
  { label: "Kış Yardımları", icon: Package }
];

type DonationFormProps = {
  initialProjectSlug?: string;
  action: (formData: FormData) => void | Promise<void>;
  formError?: string;
  formNotice?: string;
};

export function DonationForm({ initialProjectSlug, action, formError, formNotice }: DonationFormProps) {
  const [amount, setAmount] = useState<number | "custom">(250);
  const [donationType, setDonationType] = useState("Genel Bağış");
  const [selectedProject, setSelectedProject] = useState(initialProjectSlug ?? "genel");

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

      <fieldset>
        <legend className="text-lg font-bold text-dark-navy">Bağış Tutarı</legend>
        <p className="mt-1 text-sm leading-6 text-slate-500">Size uygun tutarı seçebilir veya özel tutar girebilirsiniz.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {amounts.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setAmount(item.value)}
              className={cn(
                "focus-ring rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-ocean-green/45 hover:shadow-card",
                amount === item.value ? "border-ocean-green bg-mint-green text-ocean-green" : "border-slate-200 bg-white text-slate-700"
              )}
            >
              <span className="block text-lg font-extrabold">{item.value} TL</span>
              <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">{item.impact}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount("custom")}
            className={cn(
              "focus-ring rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-ocean-green/45 hover:shadow-card sm:col-span-2",
              amount === "custom" ? "border-ocean-green bg-mint-green text-ocean-green" : "border-slate-200 bg-white text-slate-700"
            )}
          >
            <span className="block text-lg font-extrabold">Özel Tutar</span>
            <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">Belirlediğiniz tutarla genel destek havuzuna katkı verin.</span>
          </button>
        </div>
      </fieldset>

      {amount === "custom" ? (
        <TextField label="Özel Tutar" name="customAmount" type="number" min={10} step="0.01" placeholder="Tutar giriniz" required className="mt-4" />
      ) : null}
      <input type="hidden" name="amount" value={String(amount)} />

      <fieldset className="mt-7">
        <legend className="text-lg font-bold text-dark-navy">Bağış Türü</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {donationTypes.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => setDonationType(label)}
              className={cn(
                "focus-ring flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-bold transition hover:border-primary-blue/40",
                donationType === label ? "border-deep-blue bg-soft-blue text-deep-blue" : "border-slate-200 bg-white text-slate-700"
              )}
            >
              <Icon aria-hidden className="h-5 w-5 text-ocean-green" />
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <input type="hidden" name="donationType" value={donationType} />
      <SelectField label="Proje Seçimi" name="selectedProject" className="mt-6" value={selectedProject} onChange={(event) => setSelectedProject(event.target.value)}>
        <option value="genel">Genel bağış olarak değerlendirilsin</option>
        {projects.map((project) => (
          <option key={project.slug} value={project.slug}>
            {project.title}
          </option>
        ))}
      </SelectField>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TextField label="Ad Soyad" name="fullName" required autoComplete="name" maxLength={120} />
        <TextField label="E-posta" name="email" type="email" required autoComplete="email" maxLength={160} />
        <TextField label="Telefon" name="phone" type="tel" autoComplete="tel" maxLength={30} />
        <TextAreaField label="Not" name="note" placeholder="İsteğe bağlı notunuz" className="sm:col-span-2" maxLength={500} />
      </div>

      <div className="mt-6 grid gap-3 text-sm font-semibold leading-6 text-ink-muted">
        <ConsentCheckbox name="kvkkAccepted" required>
          <LegalTextLink href={legalLinks.kvkk}>KVKK Aydınlatma Metni</LegalTextLink> ile{" "}
          <LegalTextLink href={legalLinks.donationTerms}>Bağış Bilgilendirme ve Şartları</LegalTextLink>&apos;nı okudum.
        </ConsentCheckbox>
        <ConsentCheckbox name="contactPermission">
          <LegalTextLink href={legalLinks.explicitConsent}>Açık Rıza Metni</LegalTextLink> kapsamında bağış süreci, faaliyet
          ve bilgilendirme duyuruları için benimle iletişime geçilmesini kabul ediyorum.
        </ConsentCheckbox>
      </div>

      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Button type="submit" className="mt-7 w-full" showIcon>
        Bağış Ön Kaydı Oluştur
      </Button>
    </form>
  );
}
