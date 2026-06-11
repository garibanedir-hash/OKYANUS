"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CookiePreferencesModal } from "@/components/legal/CookiePreferencesModal";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_OPEN_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  acceptAllCookieConsent,
  getStoredCookieConsentSnapshot,
  hasCurrentCookieConsent,
  necessaryOnlyCookieConsent,
  parseStoredCookieConsentSnapshot,
  saveCookieConsent,
  type CookieConsentPreferences
} from "@/lib/legal/cookieConsent";

function subscribeCookieConsent(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === COOKIE_CONSENT_STORAGE_KEY) callback();
  };

  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getEmptyCookieConsentSnapshot() {
  return "";
}

export function CookieConsentBanner() {
  const [modalOpen, setModalOpen] = useState(false);
  const consentSnapshot = useSyncExternalStore(
    subscribeCookieConsent,
    getStoredCookieConsentSnapshot,
    getEmptyCookieConsentSnapshot
  );
  const preferences = useMemo(() => parseStoredCookieConsentSnapshot(consentSnapshot), [consentSnapshot]);
  const showBanner = !hasCurrentCookieConsent(preferences);

  useEffect(() => {
    const openPreferences = () => {
      setModalOpen(true);
    };

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, openPreferences);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, openPreferences);
  }, []);

  function persistPreferences(nextPreferences: CookieConsentPreferences) {
    saveCookieConsent(nextPreferences);
    setModalOpen(false);
  }

  return (
    <>
      {showBanner ? (
        <section className="fixed inset-x-0 bottom-0 z-[70] border-t border-border-soft bg-white/96 px-4 py-4 shadow-soft backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-soft-blue text-deep-blue">
                <Cookie aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-dark-navy">Çerez tercihleri</h2>
                <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-ink-muted">
                  Siteyi güvenli çalıştırmak için zorunlu çerezleri kullanıyoruz. Tanıtım aşamasında zorunlu çerezler dışında
                  kapsamlı analitik veya pazarlama çerezi kullanmıyoruz. Detaylar için{" "}
                  <Link href="/hukuki/cerez-politikasi" className="font-extrabold text-deep-blue underline-offset-4 hover:underline">
                    Çerez Politikası
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:justify-end">
              <Button type="button" variant="ghost" onClick={() => persistPreferences(necessaryOnlyCookieConsent())}>
                Sadece zorunlu çerezler
              </Button>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(true)}>
                Tercihleri yönet
              </Button>
              <Button type="button" onClick={() => persistPreferences(acceptAllCookieConsent())}>
                Tümünü kabul et
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <CookiePreferencesModal
        open={modalOpen}
        initialPreferences={preferences}
        onSave={persistPreferences}
        onAcceptAll={persistPreferences}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
