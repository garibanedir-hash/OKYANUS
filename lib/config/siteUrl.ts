import "server-only";

const PRODUCTION_SITE_URL = "https://www.okyanus.org.tr";
const LOCAL_SITE_URL = "http://localhost:3000";

function normalizeUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isLocalhost(url: URL) {
  return url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
}

export function getServerSiteUrl() {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();
  const fallbackUrl = process.env.NODE_ENV === "production" ? PRODUCTION_SITE_URL : LOCAL_SITE_URL;

  if (!rawSiteUrl) {
    return fallbackUrl;
  }

  const parsed = parseUrl(rawSiteUrl);
  if (!parsed) {
    return fallbackUrl;
  }

  if (process.env.NODE_ENV === "production") {
    if (isLocalhost(parsed) || parsed.protocol !== "https:") {
      return PRODUCTION_SITE_URL;
    }

    return normalizeUrl(parsed.origin);
  }

  if (isLocalhost(parsed)) {
    return normalizeUrl(parsed.origin);
  }

  if (parsed.protocol !== "https:") {
    return fallbackUrl;
  }

  return normalizeUrl(parsed.origin);
}

export function getAuthInviteRedirectUrl() {
  return `${getServerSiteUrl()}/giris`;
}
