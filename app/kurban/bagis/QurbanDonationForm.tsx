"use client";

import { useMemo, useState } from "react";
import type { QurbanCampaign, QurbanType } from "@/data/qurbanMock";
import { qurbanTypeLabels } from "@/data/qurbanMock";
import { formatCurrency } from "@/lib/format";
import { FormProtectionFields } from "@/components/forms/FormProtectionFields";
import { ConsentCheckbox, LegalConsentFields } from "@/components/forms/LegalConsent";
import type { TurnstilePublicConfig } from "@/lib/security/turnstilePublic";

type DonorDefaults = {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
};

export function QurbanDonationForm({
  campaigns,
  selectedSlug,
  donorDefaults,
  action,
  turnstile
}: {
  campaigns: QurbanCampaign[];
  selectedSlug?: string;
  donorDefaults?: DonorDefaults;
  action: (formData: FormData) => void | Promise<void>;
  turnstile?: TurnstilePublicConfig;
}) {
  const initialCampaign = campaigns.find((campaign) => campaign.slug === selectedSlug) ?? campaigns[0];
  const [campaignSlug, setCampaignSlug] = useState(initialCampaign?.slug ?? "");
  const [qurbanType, setQurbanType] = useState<QurbanType>(initialCampaign?.type ?? "vacip");
  const [shareCount, setShareCount] = useState(1);

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.slug === campaignSlug) ?? initialCampaign,
    [campaignSlug, campaigns, initialCampaign]
  );
  const quotaRemaining = selectedCampaign && selectedCampaign.quotaTotal > 0
    ? Math.max(0, selectedCampaign.quotaTotal - selectedCampaign.quotaReserved)
    : null;
  const campaignIsFull = quotaRemaining !== null && quotaRemaining < 1;
  const maxShareCount = campaignIsFull ? 1 : Math.min(20, quotaRemaining ?? 20);
  const selectedShareCount = Math.min(shareCount, maxShareCount);
  const totalAmount = (selectedCampaign?.unitPrice ?? 0) * selectedShareCount;

  if (!campaigns.length) {
    return (
      <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <h2 className="text-xl font-extrabold text-dark-navy">Aktif kampanya bulunamadı</h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">Kurban başvuru formu aktif kampanya yayına alındığında kullanılabilir.</p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
      <FormProtectionFields turnstile={turnstile} />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-bold text-dark-navy">
          Kurban türü
          <select
            name="qurbanType"
            value={qurbanType}
            onChange={(event) => setQurbanType(event.target.value as QurbanType)}
            className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3"
          >
            {Object.entries(qurbanTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-dark-navy">
          Kampanya
          <select
            name="campaign"
            value={campaignSlug}
            onChange={(event) => {
              const nextCampaign = campaigns.find((campaign) => campaign.slug === event.target.value);
              setCampaignSlug(event.target.value);
              if (nextCampaign) setQurbanType(nextCampaign.type);
            }}
            className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3"
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.slug}>{campaign.title}</option>
            ))}
          </select>
          {selectedCampaign ? (
            <span className="mt-2 block text-xs font-semibold leading-5 text-ink-muted">
              {selectedCampaign.regionLabel} · {selectedCampaign.country} · Birim bedel {formatCurrency(selectedCampaign.unitPrice)}
            </span>
          ) : null}
        </label>
        <label className="text-sm font-bold text-dark-navy">
          Hisse/adet
          <input
            name="shareCount"
            type="number"
            min="1"
            max={maxShareCount}
            value={selectedShareCount}
            disabled={campaignIsFull}
            onChange={(event) => {
              const nextValue = Number.parseInt(event.target.value, 10);
              setShareCount(Number.isFinite(nextValue) ? Math.min(maxShareCount, Math.max(1, nextValue)) : 1);
            }}
            className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3"
          />
          <span className="mt-2 block text-xs font-semibold leading-5 text-ink-muted">
            {campaignIsFull ? "Bu kampanyada uygun kontenjan kalmadı." : `Bu başvuruda en fazla ${maxShareCount} hisse/adet seçilebilir.`}
          </span>
        </label>
        <div className="rounded-2xl border border-border-soft bg-soft-gray p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-ink-muted">Tutar önizlemesi</p>
          <p className="mt-2 text-2xl font-black text-deep-blue">{formatCurrency(totalAmount)}</p>
          <p className="mt-1 text-xs font-semibold text-ink-muted">
            Birim bedel: {formatCurrency(selectedCampaign?.unitPrice ?? 0)}
            {quotaRemaining !== null ? ` · Kalan kontenjan: ${quotaRemaining}` : ""}
          </p>
          <p className="mt-2 text-xs font-semibold leading-5 text-ink-muted">
            Kesin tutar kampanya bedeli üzerinden kayıt sırasında yeniden doğrulanır.
          </p>
        </div>
        <label className="text-sm font-bold text-dark-navy">
          Ad soyad
          <input name="fullName" defaultValue={donorDefaults?.fullName} required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="Ad soyad" />
        </label>
        <label className="text-sm font-bold text-dark-navy">
          E-posta
          <input name="email" type="email" defaultValue={donorDefaults?.email} required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="ornek@example.org" />
          <span className="mt-2 block text-xs font-semibold leading-5 text-ink-muted">Başvuru ve bilgilendirme takibi için kullanılır.</span>
        </label>
        <label className="text-sm font-bold text-dark-navy">
          Telefon
          <input name="phone" defaultValue={donorDefaults?.phone} required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="+90 5** *** ** **" />
          <span className="mt-2 block text-xs font-semibold leading-5 text-ink-muted">Sadece kurban süreciyle ilgili zorunlu iletişim için alınır.</span>
        </label>
        <label className="text-sm font-bold text-dark-navy">
          Şehir
          <input name="city" defaultValue={donorDefaults?.city} className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="İl bilgisi" />
        </label>
        <label className="text-sm font-bold text-dark-navy md:col-span-2">
          Not
          <textarea name="note" rows={4} maxLength={500} className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="Kurban niyeti veya bilgilendirme tercihi" />
        </label>
      </div>

      <div className="mt-6 rounded-lg border border-border-soft bg-soft-gray p-5">
        <h2 className="text-lg font-extrabold text-dark-navy">Vekalet Metni</h2>
        <p className="mt-3 text-sm leading-7 text-ink-muted">
          {selectedCampaign?.delegationText ?? "Vekalet metni kampanya bilgisi üzerinden hazırlanır."}
        </p>
        <p className="mt-3 text-xs font-bold leading-6 text-ink-muted">
          Vekalet ve bilgilendirme metinleri dernek yönetimi tarafından düzenli olarak gözden geçirilir; gerekli durumlarda ekibimiz sizinle iletişime geçer.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        <ConsentCheckbox name="delegationAccepted" required>
          Vekalet metnini okudum ve kurban kesimi için Okyanus İnsani Yardım Derneği&apos;ni vekil tayin ediyorum.
        </ConsentCheckbox>
        <LegalConsentFields context="qurban" showCommunicationPermission />
      </div>

      <button
        type="submit"
        disabled={campaignIsFull}
        className="focus-ring mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ocean-green px-5 py-3 text-sm font-extrabold text-white transition hover:bg-deep-blue disabled:cursor-not-allowed disabled:bg-ink-muted"
      >
        Kurban Bağış Başvurusu Gönder
      </button>
    </form>
  );
}
