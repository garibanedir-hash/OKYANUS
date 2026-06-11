import "server-only";

import { headers } from "next/headers";
import {
  createLegalConsentMetadata,
  parseLegalConsentFormData,
  type LegalConsentAuditFields,
  type LegalConsentContext
} from "@/lib/legal/consent";

export async function readServerLegalConsent(
  formData: FormData,
  fallbackContext: LegalConsentContext,
  metadata?: Record<string, unknown>
): Promise<LegalConsentAuditFields> {
  const parsed = parseLegalConsentFormData(formData, fallbackContext);
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 500) || null;

  return {
    ...parsed,
    consentGivenAt: new Date().toISOString(),
    consentIp: null,
    consentUserAgent: userAgent,
    consentMetadata: createLegalConsentMetadata(parsed.context, metadata)
  };
}

export function assertLegalConsentRequirements(
  consent: Pick<LegalConsentAuditFields, "kvkkAcknowledged" | "explicitConsentGiven">,
  options?: {
    requireExplicitConsent?: boolean;
    kvkkMessage?: string;
    explicitConsentMessage?: string;
  }
) {
  if (!consent.kvkkAcknowledged) {
    throw new Error(options?.kvkkMessage ?? "KVKK Aydınlatma Metni onayı zorunludur.");
  }

  if (options?.requireExplicitConsent && !consent.explicitConsentGiven) {
    throw new Error(options.explicitConsentMessage ?? "Açık rıza onayı zorunludur.");
  }
}
