"use client";

import { Cookie, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CookieConsentPreferences } from "@/lib/legal/cookieConsent";
import { acceptAllCookieConsent, createDefaultCookieConsent } from "@/lib/legal/cookieConsent";

type PreferenceKey = "functional" | "analytics" | "marketing";

const preferenceItems: Array<{
  key: PreferenceKey;
  title: string;
  description: string;
}> = [
  {
    key: "functional",
    title: "İşlevsel çerezler",
    description: "Tercih ve kullanım kolaylığı sağlayan ayarları hatırlamak için kullanılabilir."
  },
  {
    key: "analytics",
    title: "Analitik çerezler",
    description: "Site performansını ve ziyaret deneyimini toplu şekilde anlamaya yardımcı olabilir."
  },
  {
    key: "marketing",
    title: "Pazarlama çerezleri",
    description: "İleride reklam veya kampanya ölçüm araçları eklenirse ayrıca tercih yönetimi için kullanılır."
  }
];

type CookiePreferencesModalProps = {
  open: boolean;
  initialPreferences: CookieConsentPreferences | null;
  onSave: (preferences: CookieConsentPreferences) => void;
  onAcceptAll: (preferences: CookieConsentPreferences) => void;
  onClose: () => void;
};

export function CookiePreferencesModal({
  open,
  initialPreferences,
  onSave,
  onAcceptAll,
  onClose
}: CookiePreferencesModalProps) {
  if (!open) return null;

  const preferences = initialPreferences ?? createDefaultCookieConsent();

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-dark-navy/45 px-4 py-5 backdrop-blur-sm sm:items-center sm:justify-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border-soft bg-white p-5 shadow-soft sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-mint-green text-ocean-green">
              <Cookie aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 id="cookie-preferences-title" className="text-xl font-extrabold text-dark-navy">
                Çerez tercihleri
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">
                Zorunlu çerezler siteyi güvenli ve düzgün çalıştırmak için kullanılır. Diğer kategorileri dilediğiniz gibi yönetebilirsiniz.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-soft-gray hover:text-dark-navy"
            aria-label="Çerez tercihlerini kapat"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onSave(
              createDefaultCookieConsent({
                functional: formData.get("functional") === "on",
                analytics: formData.get("analytics") === "on",
                marketing: formData.get("marketing") === "on"
              })
            );
          }}
        >
          <div className="mt-5 rounded-lg border border-ocean-green/15 bg-mint-green/40 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 text-ocean-green" />
              <div>
                <p className="text-sm font-extrabold text-dark-navy">Zorunlu çerezler</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">
                  Her zaman açık tutulur; güvenlik, tercih kaydı ve temel site işlevleri için gereklidir.
                </p>
              </div>
              <span className="ml-auto rounded-full bg-ocean-green px-3 py-1 text-xs font-extrabold text-white">Açık</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {preferenceItems.map((item) => (
              <label key={item.key} className="flex items-start justify-between gap-4 rounded-lg border border-border-soft bg-soft-gray p-4">
                <span>
                  <span className="block text-sm font-extrabold text-dark-navy">{item.title}</span>
                  <span className="mt-1 block text-sm font-semibold leading-6 text-ink-muted">{item.description}</span>
                </span>
                <input
                  name={item.key}
                  type="checkbox"
                  defaultChecked={preferences[item.key]}
                  className="mt-1 h-5 w-5 shrink-0 accent-ocean-green"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="submit" variant="ghost">
              Tercihlerimi kaydet
            </Button>
            <Button type="button" onClick={() => onAcceptAll(acceptAllCookieConsent())}>
              Tümünü kabul et
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
