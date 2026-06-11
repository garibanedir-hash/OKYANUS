import "server-only";

import { asAdminWriteClient, type DbError } from "@/lib/data/adminWriteClient";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LegalConsentAuditFields } from "@/lib/legal/consent";

type InsertResultRow = {
  id: string;
};

export type CreateContactMessageInput = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  legalConsent: LegalConsentAuditFields;
};

export type CreateVolunteerApplicationInput = {
  fullName: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  age?: number | null;
  interestArea: string;
  experience?: string | null;
  note?: string | null;
  legalConsent: LegalConsentAuditFields;
};

export class PublicFormWriteError extends Error {
  constructor(message: string, public code = "public_form_write_failed") {
    super(message);
    this.name = "PublicFormWriteError";
  }
}

function getAdminDb() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new PublicFormWriteError("Form kayıt sistemi şu anda hazır değil. Lütfen daha sonra tekrar deneyin.", "missing_admin_client");
  }

  return asAdminWriteClient(supabase);
}

function friendlyWriteError(error: DbError | null, fallback: string) {
  const message = error?.message ?? "";

  if (/permission|42501|row-level/i.test(message)) return "Form kaydı için yetki doğrulaması tamamlanamadı.";
  if (/not null|23502/i.test(message)) return "Form kaydı için zorunlu bilgiler eksik.";
  if (/check constraint|23514/i.test(message)) return "Form bilgilerinden biri geçerli görünmüyor.";

  return fallback;
}

function mapLegalConsent(legalConsent: LegalConsentAuditFields) {
  return {
    kvkk_acknowledged: legalConsent.kvkkAcknowledged,
    explicit_consent_given: legalConsent.explicitConsentGiven,
    communication_permission_given: legalConsent.communicationPermissionGiven,
    consent_text_version: legalConsent.consentTextVersion,
    consent_given_at: legalConsent.consentGivenAt,
    consent_ip: legalConsent.consentIp,
    consent_user_agent: legalConsent.consentUserAgent,
    consent_metadata: legalConsent.consentMetadata
  };
}

export async function createContactMessage(input: CreateContactMessageInput) {
  const db = getAdminDb();
  const { data, error } = await db
    .from<InsertResultRow>("contact_messages")
    .insert({
      full_name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      status: "new",
      ...mapLegalConsent(input.legalConsent)
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new PublicFormWriteError(
      friendlyWriteError(error, "Mesajınız kaydedilemedi. Lütfen bilgileri kontrol edip tekrar deneyin."),
      error?.code ?? "contact_insert_failed"
    );
  }

  return { id: data.id };
}

export async function createVolunteerApplication(input: CreateVolunteerApplicationInput) {
  const db = getAdminDb();
  const { data, error } = await db
    .from<InsertResultRow>("volunteer_applications")
    .insert({
      full_name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      city: input.city?.trim() || null,
      age: input.age ?? null,
      interest_area: input.interestArea.trim(),
      experience: input.experience?.trim() || null,
      note: input.note?.trim() || null,
      status: "new",
      ...mapLegalConsent(input.legalConsent)
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new PublicFormWriteError(
      friendlyWriteError(error, "Gönüllü başvurunuz kaydedilemedi. Lütfen bilgileri kontrol edip tekrar deneyin."),
      error?.code ?? "volunteer_insert_failed"
    );
  }

  return { id: data.id };
}
