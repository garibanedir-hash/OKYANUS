"use client";

import { useMemo, useState } from "react";
import type { SponsorshipProgram } from "@/data/orphanSponsorshipMock";
import { formatCurrency } from "@/lib/format";
import { LegalConsentFields } from "@/components/forms/LegalConsent";
import { createSponsorshipApplicationAction } from "./actions";

export function SponsorshipApplicationForm({
  programs,
  selectedSlug
}: {
  programs: SponsorshipProgram[];
  selectedSlug?: string;
}) {
  const initialSlug = selectedSlug && programs.some((program) => program.slug === selectedSlug) ? selectedSlug : programs[0]?.slug ?? "";
  const [programSlug, setProgramSlug] = useState(initialSlug);
  const selectedProgram = useMemo(
    () => programs.find((program) => program.slug === programSlug) ?? programs[0],
    [programSlug, programs]
  );

  if (!programs.length) {
    return (
      <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <h2 className="text-2xl font-extrabold text-dark-navy">Aktif sponsorluk programı bulunmuyor</h2>
        <p className="mt-3 text-sm font-semibold leading-7 text-ink-muted">
          Yetim hamiliği başvurusu için aktif program açıldığında form yeniden kullanılabilir olacaktır.
        </p>
      </div>
    );
  }

  return (
    <form action={createSponsorshipApplicationAction} className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-bold text-dark-navy">
          Sponsorluk programı
          <select
            name="program"
            value={programSlug}
            onChange={(event) => setProgramSlug(event.target.value)}
            required
            className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3"
          >
            {programs.map((program) => (
              <option key={program.id} value={program.slug}>
                {program.title} · {formatCurrency(program.monthlyAmount)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-dark-navy">
          Aylık destek tutarı
          <input
            value={selectedProgram ? formatCurrency(selectedProgram.monthlyAmount) : ""}
            readOnly
            className="mt-2 w-full rounded-2xl border border-border-soft bg-soft-gray px-4 py-3 text-ink-muted"
          />
          <input type="hidden" name="requestedAmount" value={selectedProgram?.monthlyAmount ?? 0} />
        </label>
        <label className="text-sm font-bold text-dark-navy">
          Ad soyad
          <input name="fullName" required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="Ad soyad" />
        </label>
        <label className="text-sm font-bold text-dark-navy">
          E-posta
          <input name="email" type="email" required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="ornek@example.org" />
        </label>
        <label className="text-sm font-bold text-dark-navy">
          Telefon
          <input name="phone" required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="+90 5** *** ** **" />
        </label>
        <label className="text-sm font-bold text-dark-navy">
          Şehir
          <input name="city" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="İl bilgisi" />
        </label>
        <label className="text-sm font-bold text-dark-navy">
          Destek periyodu
          <select name="supportPeriod" defaultValue="monthly" required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3">
            <option value="monthly">Aylık destek</option>
            <option value="quarterly">3 aylık takip</option>
            <option value="yearly">Yıllık planlama</option>
          </select>
        </label>
        <label className="text-sm font-bold text-dark-navy md:col-span-2">
          Not
          <textarea name="note" rows={4} maxLength={500} className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="Destek tercihiniz veya bilgilendirme notunuz" />
        </label>
      </div>

      <div className="mt-5 grid gap-3">
        <LegalConsentFields context="orphan" showCommunicationPermission />
      </div>

      <div className="mt-5 rounded-lg border border-ocean-green/15 bg-mint-green/35 p-4 text-sm font-semibold leading-6 text-ink-muted">
        Başvuru alındıktan sonra dernek yetkilileri güvenli eşleştirme ve bilgilendirme sürecini başlatır. Düzenli destek detayları sizinle mahremiyet ilkeleri gözetilerek paylaşılır.
      </div>

      <button type="submit" className="focus-ring mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ocean-green px-5 py-3 text-sm font-extrabold text-white transition hover:bg-deep-blue">
        Başvuruyu Gönder
      </button>
    </form>
  );
}
