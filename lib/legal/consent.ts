export const LEGAL_CONSENT_VERSION = "2026-06-11";

export const LEGAL_CONSENT_CONTEXTS = ["contact", "volunteer", "donation", "qurban", "orphan", "registration"] as const;

export type LegalConsentContext = (typeof LEGAL_CONSENT_CONTEXTS)[number];

export type LegalConsentFormState = {
  context: LegalConsentContext;
  kvkkAcknowledged: boolean;
  explicitConsentGiven: boolean;
  communicationPermissionGiven: boolean;
  consentTextVersion: string;
};

export type LegalConsentAuditFields = LegalConsentFormState & {
  consentGivenAt: string | null;
  consentIp: string | null;
  consentUserAgent: string | null;
  consentMetadata: Record<string, unknown>;
};

export const legalConsentPageSlugsByContext: Record<LegalConsentContext, string[]> = {
  contact: ["iletisim-formu-aydinlatma-metni", "kvkk-aydinlatma-metni", "acik-riza-metni"],
  volunteer: ["gonullu-basvuru-aydinlatma-metni", "kvkk-aydinlatma-metni", "acik-riza-metni"],
  donation: ["kvkk-aydinlatma-metni", "acik-riza-metni", "bagis-bilgilendirme-ve-sartlari"],
  qurban: ["kvkk-aydinlatma-metni", "acik-riza-metni", "bagis-bilgilendirme-ve-sartlari"],
  orphan: ["kvkk-aydinlatma-metni", "acik-riza-metni", "bagis-bilgilendirme-ve-sartlari"],
  registration: ["kvkk-aydinlatma-metni", "acik-riza-metni", "kullanim-sartlari"]
};

const kvkkFieldNames = ["kvkkAcknowledged", "kvkkAccepted", "contactKvkkAccepted", "volunteerKvkkAccepted"];
const explicitConsentFieldNames = ["explicitConsentGiven", "volunteerExplicitConsent"];
const communicationFieldNames = [
  "communicationPermissionGiven",
  "communicationPermission",
  "contactPermission",
  "contactAnnouncementPermission",
  "volunteerAnnouncementPermission"
];

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getBooleanFromAny(formData: FormData, fieldNames: string[]) {
  return fieldNames.some((fieldName) => {
    const value = formData.get(fieldName);
    return value === "on" || value === "true" || value === "1";
  });
}

function isLegalConsentContext(value: string): value is LegalConsentContext {
  return (LEGAL_CONSENT_CONTEXTS as readonly string[]).includes(value);
}

export function parseLegalConsentFormData(
  formData: FormData,
  fallbackContext: LegalConsentContext
): LegalConsentFormState {
  const submittedContext = getString(formData, "consentContext");
  const version = getString(formData, "consentTextVersion") || getString(formData, "legalVersion") || LEGAL_CONSENT_VERSION;

  return {
    context: isLegalConsentContext(submittedContext) ? submittedContext : fallbackContext,
    kvkkAcknowledged: getBooleanFromAny(formData, kvkkFieldNames),
    explicitConsentGiven: getBooleanFromAny(formData, explicitConsentFieldNames),
    communicationPermissionGiven: getBooleanFromAny(formData, communicationFieldNames),
    consentTextVersion: version
  };
}

export function createLegalConsentMetadata(
  context: LegalConsentContext,
  extra?: Record<string, unknown>
): Record<string, unknown> {
  return {
    context,
    legalPageSlugs: legalConsentPageSlugsByContext[context],
    ipCollection: "not_collected",
    ...extra
  };
}
