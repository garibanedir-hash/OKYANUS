export const COOKIE_CONSENT_VERSION = "2026-06-11";
export const COOKIE_CONSENT_STORAGE_KEY = "okyanus.cookieConsent";
export const COOKIE_CONSENT_COOKIE_NAME = "okyanus_cookie_consent";
export const COOKIE_CONSENT_OPEN_EVENT = "okyanus:cookie-preferences-open";
export const COOKIE_CONSENT_CHANGED_EVENT = "okyanus:cookie-preferences-changed";

export type CookieConsentPreferences = {
  version: string;
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  savedAt: string;
};

function hasBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizePreferences(value: Partial<CookieConsentPreferences> | null | undefined): CookieConsentPreferences | null {
  if (!value) return null;

  return {
    version: typeof value.version === "string" && value.version ? value.version : COOKIE_CONSENT_VERSION,
    necessary: true,
    functional: Boolean(value.functional),
    analytics: Boolean(value.analytics),
    marketing: Boolean(value.marketing),
    savedAt: typeof value.savedAt === "string" && value.savedAt ? value.savedAt : new Date().toISOString()
  };
}

function writePreferenceCookie(preferences: CookieConsentPreferences) {
  if (typeof document === "undefined") return;

  const maxAge = 60 * 60 * 24 * 365;
  const value = encodeURIComponent(JSON.stringify(preferences));
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export function createDefaultCookieConsent(
  overrides?: Partial<Omit<CookieConsentPreferences, "necessary" | "version" | "savedAt">>
): CookieConsentPreferences {
  return {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    functional: Boolean(overrides?.functional),
    analytics: Boolean(overrides?.analytics),
    marketing: Boolean(overrides?.marketing),
    savedAt: new Date().toISOString()
  };
}

export function necessaryOnlyCookieConsent() {
  return createDefaultCookieConsent();
}

export function acceptAllCookieConsent() {
  return createDefaultCookieConsent({
    functional: true,
    analytics: true,
    marketing: true
  });
}

export function getStoredCookieConsent(): CookieConsentPreferences | null {
  if (!hasBrowserStorage()) return null;

  try {
    return parseStoredCookieConsentSnapshot(getStoredCookieConsentSnapshot());
  } catch {
    return null;
  }
}

export function getStoredCookieConsentSnapshot() {
  if (!hasBrowserStorage()) return "";
  return window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) ?? "";
}

export function parseStoredCookieConsentSnapshot(snapshot: string): CookieConsentPreferences | null {
  if (!snapshot) return null;

  try {
    return normalizePreferences(JSON.parse(snapshot) as Partial<CookieConsentPreferences>);
  } catch {
    return null;
  }
}

export function saveCookieConsent(preferences: CookieConsentPreferences) {
  if (!hasBrowserStorage()) return;

  const normalized = normalizePreferences(preferences);
  if (!normalized) return;

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(normalized));
  writePreferenceCookie(normalized);
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
}

export function hasCurrentCookieConsent(preferences: CookieConsentPreferences | null) {
  return Boolean(preferences && preferences.version === COOKIE_CONSENT_VERSION && preferences.necessary === true);
}

export function openCookiePreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
}
