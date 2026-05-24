import "server-only";

import { logAdminAction } from "@/lib/audit/auditLogger";
import { asAdminWriteClient, type DbError } from "@/lib/data/adminWriteClient";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ProgramForApplicationRow = {
  id: string;
  slug: string;
  title: string;
  monthly_amount: number | string | null;
  currency: string | null;
  status: "draft" | "active" | "paused" | "completed" | "archived";
};

type ApplicationInsertRow = {
  id: string;
  application_no: string;
  requested_amount: number | string | null;
  currency: string | null;
};

type ApplicationForMatchRow = {
  id: string;
  application_no: string;
  sponsor_account_id: string | null;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  applicant_city: string | null;
  program_id: string | null;
  requested_amount: number | string | null;
  currency: string | null;
  support_period: string | null;
  note: string | null;
  status: "pending" | "reviewing" | "approved" | "matched" | "rejected" | "cancelled" | "archived";
  kvkk_accepted: boolean;
  contact_permission: boolean;
  source: string | null;
};

type OrphanForMatchRow = {
  id: string;
  code: string;
  safe_name: string | null;
  display_name: string | null;
  status: "draft" | "active" | "sponsored" | "waiting" | "inactive" | "archived";
  sponsorship_need_amount: number | string | null;
};

type MatchRow = {
  id: string;
  application_id: string | null;
  sponsorship_id: string | null;
  orphan_id: string | null;
  sponsor_account_id: string | null;
  status: "proposed" | "approved" | "active" | "cancelled" | "archived";
};

type SponsorshipInsertRow = {
  id: string;
  sponsorship_no: string;
};

type QueryResult<T> = Promise<{ data: T | null; error: DbError | null }>;

export type ProgramForApplication = {
  id: string;
  slug: string;
  title: string;
  monthlyAmount: number;
  currency: string;
  status: ProgramForApplicationRow["status"];
};

export type CreateSponsorshipApplicationInput = {
  programIdOrSlug: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantCity?: string | null;
  supportPeriod: "monthly" | "quarterly" | "yearly";
  note?: string | null;
  kvkkAccepted: boolean;
  contactPermission: boolean;
  source?: string;
};

export type CreateSponsorshipApplicationContext = {
  userId?: string | null;
  sponsorAccountId?: string | null;
};

export type CreateSponsorshipApplicationResult = {
  applicationId: string;
  applicationNo: string;
  requestedAmount: number;
  currency: string;
  sponsorAccountId: string | null;
};

export type MatchWorkflowResult = {
  matchId: string;
  sponsorshipId: string;
  sponsorshipNo: string;
  applicationNo: string;
  sponsorAccountId: string | null;
  sponsorName: string;
  sponsorEmail: string;
  sponsorPhone: string | null;
  monthlyAmount: number;
  currency: string;
};

export class OrphanSponsorshipWriteError extends Error {
  constructor(message: string, public code = "orphan_sponsorship_write_failed") {
    super(message);
    this.name = "OrphanSponsorshipWriteError";
  }
}

function parseNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function friendlyWriteError(error: DbError | null, fallback: string) {
  const message = error?.message ?? "";

  if (/permission|42501|row-level/i.test(message)) return "Yetki doğrulaması tamamlanamadı. Lütfen tekrar deneyin.";
  if (/duplicate|unique/i.test(message)) return "Bu kayıt için tekrar eden bir numara oluştu. Lütfen tekrar deneyin.";
  if (/foreign key|23503/i.test(message)) return "Seçilen program veya yetim profili doğrulanamadı.";
  if (/not null|23502/i.test(message)) return "Zorunlu bilgiler eksik görünüyor.";

  return fallback;
}

function getAdminDb() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new OrphanSponsorshipWriteError("Yetim hamiliği kayıt sistemi şu anda hazır değil. Lütfen daha sonra tekrar deneyin.", "missing_admin_client");
  }

  return asAdminWriteClient(supabase);
}

function addMonths(date: Date, supportPeriod: string | null | undefined) {
  const copy = new Date(date);
  const monthCount = supportPeriod === "yearly" ? 12 : supportPeriod === "quarterly" ? 3 : 1;
  copy.setMonth(copy.getMonth() + monthCount);
  return copy.toISOString().slice(0, 10);
}

export async function getProgramForApplication(programIdOrSlug: string): Promise<ProgramForApplication> {
  const db = getAdminDb();
  const byId = isUuid(programIdOrSlug);
  const { data, error } = await db
    .from<ProgramForApplicationRow>("sponsorship_programs")
    .select("id, slug, title, monthly_amount, currency, status")
    .eq(byId ? "id" : "slug", programIdOrSlug)
    .maybeSingle();

  if (error || !data) {
    throw new OrphanSponsorshipWriteError("Seçilen yetim hamiliği programı bulunamadı.", error?.code ?? "program_missing");
  }

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    monthlyAmount: parseNumber(data.monthly_amount),
    currency: data.currency ?? "TRY",
    status: data.status
  };
}

export async function appendSponsorshipStatusLog(payload: {
  applicationId?: string | null;
  sponsorshipId?: string | null;
  orphanId?: string | null;
  oldStatus?: string | null;
  newStatus: string;
  eventType: string;
  actorId?: string | null;
  actorRole?: string | null;
  note?: string | null;
}) {
  try {
    const db = getAdminDb();
    const { error } = await db.from("sponsorship_status_logs").insert({
      application_id: payload.applicationId ?? null,
      sponsorship_id: payload.sponsorshipId ?? null,
      orphan_id: payload.orphanId ?? null,
      old_status: payload.oldStatus ?? null,
      new_status: payload.newStatus,
      event_type: payload.eventType,
      actor_id: payload.actorId ?? null,
      actor_role: payload.actorRole ?? null,
      note: payload.note ?? null
    });

    if (error && process.env.NODE_ENV !== "production") {
      console.warn("[orphan-sponsorship-status] Status log could not be written.", {
        code: error.code ?? "no-code",
        eventType: payload.eventType
      });
    }
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[orphan-sponsorship-status] Status log skipped.");
    }
  }
}

export async function createSponsorshipApplication(
  input: CreateSponsorshipApplicationInput,
  context: CreateSponsorshipApplicationContext = {}
): Promise<CreateSponsorshipApplicationResult> {
  const program = await getProgramForApplication(input.programIdOrSlug);
  if (program.status !== "active") {
    throw new OrphanSponsorshipWriteError("Seçtiğiniz yetim hamiliği programı şu anda aktif değil.", "program_inactive");
  }

  if (program.monthlyAmount <= 0) {
    throw new OrphanSponsorshipWriteError("Seçilen program için aylık destek tutarı henüz hazır değil.", "program_amount_missing");
  }

  if (!input.kvkkAccepted) {
    throw new OrphanSponsorshipWriteError("KVKK onayı olmadan yetim hamiliği başvurusu alınamaz.", "kvkk_required");
  }

  const db = getAdminDb();
  const { data, error } = await db
    .from<ApplicationInsertRow>("sponsorship_applications")
    .insert({
      sponsor_account_id: context.sponsorAccountId ?? null,
      applicant_name: input.applicantName.trim(),
      applicant_email: input.applicantEmail.trim().toLowerCase(),
      applicant_phone: input.applicantPhone.trim(),
      applicant_city: input.applicantCity?.trim() || null,
      program_id: program.id,
      requested_amount: program.monthlyAmount,
      currency: program.currency,
      support_period: input.supportPeriod,
      note: input.note?.trim() || null,
      status: "pending",
      kvkk_accepted: true,
      contact_permission: input.contactPermission,
      source: input.source ?? "web"
    })
    .select("id, application_no, requested_amount, currency")
    .single();

  if (error || !data) {
    throw new OrphanSponsorshipWriteError(
      friendlyWriteError(error, "Yetim hamiliği başvurusu oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin."),
      error?.code ?? "application_insert_failed"
    );
  }

  await appendSponsorshipStatusLog({
    applicationId: data.id,
    newStatus: "pending",
    eventType: "application_created",
    actorId: context.userId ?? null,
    actorRole: context.sponsorAccountId ? "sponsor" : "guest",
    note: "Başvuru web formu üzerinden alındı."
  });

  if (context.userId) {
    await logAdminAction({
      actorId: context.userId,
      action: "orphan.application.create",
      entityType: "sponsorship_applications",
      entityId: data.id,
      summary: "Yetim hamiliği başvurusu oluşturuldu",
      metadata: {
        applicationNo: data.application_no,
        programId: program.id,
        source: input.source ?? "web"
      }
    });
  }

  return {
    applicationId: data.id,
    applicationNo: data.application_no,
    requestedAmount: parseNumber(data.requested_amount),
    currency: data.currency ?? program.currency,
    sponsorAccountId: context.sponsorAccountId ?? null
  };
}

async function getApplicationForMatch(applicationId: string) {
  const db = getAdminDb();
  const { data, error } = await db
    .from<ApplicationForMatchRow>("sponsorship_applications")
    .select("id, application_no, sponsor_account_id, applicant_name, applicant_email, applicant_phone, applicant_city, program_id, requested_amount, currency, support_period, note, status, kvkk_accepted, contact_permission, source")
    .eq("id", applicationId)
    .maybeSingle();

  if (error || !data) {
    throw new OrphanSponsorshipWriteError("Başvuru kaydı bulunamadı.", error?.code ?? "application_missing");
  }

  return data;
}

async function getOrphanForMatch(orphanId: string) {
  const db = getAdminDb();
  const { data, error } = await db
    .from<OrphanForMatchRow>("orphan_profiles")
    .select("id, code, safe_name, display_name, status, sponsorship_need_amount")
    .eq("id", orphanId)
    .maybeSingle();

  if (error || !data) {
    throw new OrphanSponsorshipWriteError("Yetim profili bulunamadı.", error?.code ?? "orphan_missing");
  }

  return data;
}

async function getMatch(matchId: string) {
  const db = getAdminDb();
  const { data, error } = await db
    .from<MatchRow>("sponsorship_matches")
    .select("id, application_id, sponsorship_id, orphan_id, sponsor_account_id, status")
    .eq("id", matchId)
    .maybeSingle();

  if (error || !data) {
    throw new OrphanSponsorshipWriteError("Eşleştirme kaydı bulunamadı.", error?.code ?? "match_missing");
  }

  return data;
}

export async function createSponsorshipMatch(input: {
  applicationId: string;
  orphanId: string;
  actorId: string;
  note?: string | null;
}) {
  const application = await getApplicationForMatch(input.applicationId);
  if (!["pending", "reviewing", "approved"].includes(application.status)) {
    throw new OrphanSponsorshipWriteError("Bu başvuru eşleştirme için uygun durumda değil.", "application_status_invalid");
  }

  const orphan = await getOrphanForMatch(input.orphanId);
  if (!["active", "waiting"].includes(orphan.status)) {
    throw new OrphanSponsorshipWriteError("Seçilen yetim profili eşleştirme için uygun durumda değil.", "orphan_status_invalid");
  }

  const db = getAdminDb();
  const { data, error } = await db
    .from<MatchRow>("sponsorship_matches")
    .insert({
      application_id: application.id,
      orphan_id: orphan.id,
      sponsor_account_id: application.sponsor_account_id,
      status: "proposed",
      proposed_by: input.actorId,
      note: input.note?.trim() || null
    })
    .select("id, application_id, sponsorship_id, orphan_id, sponsor_account_id, status")
    .single();

  if (error || !data) {
    throw new OrphanSponsorshipWriteError(
      friendlyWriteError(error, "Eşleştirme önerisi oluşturulamadı."),
      error?.code ?? "match_insert_failed"
    );
  }

  await appendSponsorshipStatusLog({
    applicationId: application.id,
    orphanId: orphan.id,
    oldStatus: application.status,
    newStatus: "proposed",
    eventType: "match_proposed",
    actorId: input.actorId,
    actorRole: "admin",
    note: input.note ?? "Admin eşleştirme önerisi oluşturdu."
  });

  return data;
}

export async function approveSponsorshipMatch(matchId: string, actorId: string) {
  const db = getAdminDb();
  const { data, error } = await db
    .from<MatchRow>("sponsorship_matches")
    .update({
      status: "approved",
      approved_by: actorId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", matchId)
    .select("id, application_id, sponsorship_id, orphan_id, sponsor_account_id, status")
    .single();

  if (error || !data) {
    throw new OrphanSponsorshipWriteError(
      friendlyWriteError(error, "Eşleştirme onaylanamadı."),
      error?.code ?? "match_approve_failed"
    );
  }

  await appendSponsorshipStatusLog({
    applicationId: data.application_id,
    orphanId: data.orphan_id,
    oldStatus: "proposed",
    newStatus: "approved",
    eventType: "match_approved",
    actorId,
    actorRole: "admin"
  });

  return data;
}

export async function createSponsorshipFromMatch(matchId: string, actorId: string): Promise<MatchWorkflowResult> {
  const match = await getMatch(matchId);
  if (!match.application_id || !match.orphan_id) {
    throw new OrphanSponsorshipWriteError("Eşleştirme kaydı eksik görünüyor.", "match_incomplete");
  }

  if (match.sponsorship_id) {
    throw new OrphanSponsorshipWriteError("Bu eşleştirme için sponsorluk kaydı zaten oluşturulmuş.", "sponsorship_exists");
  }

  const application = await getApplicationForMatch(match.application_id);
  const orphan = await getOrphanForMatch(match.orphan_id);
  const program = application.program_id ? await getProgramForApplication(application.program_id) : null;

  if (!program) {
    throw new OrphanSponsorshipWriteError("Başvuruya bağlı program doğrulanamadı.", "program_missing");
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const nextPaymentDate = addMonths(now, application.support_period);
  const db = getAdminDb();
  const { data: sponsorship, error: sponsorshipError } = await db
    .from<SponsorshipInsertRow>("sponsorships")
    .insert({
      application_id: application.id,
      sponsor_account_id: application.sponsor_account_id,
      sponsor_name: application.applicant_name,
      sponsor_email: application.applicant_email,
      sponsor_phone: application.applicant_phone,
      orphan_id: orphan.id,
      program_id: program.id,
      monthly_amount: program.monthlyAmount,
      currency: program.currency,
      start_date: today,
      status: "payment_pending",
      payment_status: "pending",
      next_payment_date: nextPaymentDate,
      note: application.note,
      kvkk_accepted: application.kvkk_accepted,
      contact_permission: application.contact_permission,
      source: application.source ?? "web",
      matched_by: actorId,
      matched_at: now.toISOString(),
      visibility_level: "limited"
    })
    .select("id, sponsorship_no")
    .single();

  if (sponsorshipError || !sponsorship) {
    throw new OrphanSponsorshipWriteError(
      friendlyWriteError(sponsorshipError, "Sponsorluk kaydı oluşturulamadı."),
      sponsorshipError?.code ?? "sponsorship_insert_failed"
    );
  }

  const timestamp = new Date().toISOString();
  const { error: matchError } = await db
    .from("sponsorship_matches")
    .update({ status: "active", sponsorship_id: sponsorship.id, updated_at: timestamp })
    .eq("id", match.id)
    .select("id")
    .single();

  const { error: applicationError } = await db
    .from("sponsorship_applications")
    .update({ status: "matched", reviewed_by: actorId, reviewed_at: timestamp, updated_at: timestamp })
    .eq("id", application.id)
    .select("id")
    .single();

  const { error: orphanError } = await db
    .from("orphan_profiles")
    .update({ status: "sponsored", updated_at: timestamp })
    .eq("id", orphan.id)
    .select("id")
    .single();

  if (matchError || applicationError || orphanError) {
    throw new OrphanSponsorshipWriteError(
      friendlyWriteError(matchError ?? applicationError ?? orphanError, "Sponsorluk oluşturuldu ancak durum güncellemeleri tamamlanamadı."),
      matchError?.code ?? applicationError?.code ?? orphanError?.code ?? "workflow_update_failed"
    );
  }

  await appendSponsorshipStatusLog({
    applicationId: application.id,
    sponsorshipId: sponsorship.id,
    orphanId: orphan.id,
    oldStatus: application.status,
    newStatus: "matched",
    eventType: "application_matched",
    actorId,
    actorRole: "admin",
    note: "Başvuru uygun yetim profiliyle eşleştirildi."
  });

  await appendSponsorshipStatusLog({
    applicationId: application.id,
    sponsorshipId: sponsorship.id,
    orphanId: orphan.id,
    newStatus: "payment_pending",
    eventType: "sponsorship_created",
    actorId,
    actorRole: "admin",
    note: "Ödeme entegrasyonu bekleyen sponsorluk kaydı oluşturuldu."
  });

  await appendSponsorshipStatusLog({
    applicationId: application.id,
    sponsorshipId: sponsorship.id,
    orphanId: orphan.id,
    oldStatus: orphan.status,
    newStatus: "sponsored",
    eventType: "orphan_marked_sponsored",
    actorId,
    actorRole: "admin"
  });

  await logAdminAction({
    actorId,
    action: "orphan.sponsorship.match",
    entityType: "sponsorships",
    entityId: sponsorship.id,
    summary: "Yetim hamiliği başvurusu eşleştirildi",
    metadata: {
      applicationNo: application.application_no,
      sponsorshipNo: sponsorship.sponsorship_no,
      orphanCode: orphan.code,
      paymentStatus: "pending"
    }
  });

  return {
    matchId: match.id,
    sponsorshipId: sponsorship.id,
    sponsorshipNo: sponsorship.sponsorship_no,
    applicationNo: application.application_no,
    sponsorAccountId: application.sponsor_account_id,
    sponsorName: application.applicant_name,
    sponsorEmail: application.applicant_email,
    sponsorPhone: application.applicant_phone,
    monthlyAmount: program.monthlyAmount,
    currency: program.currency
  };
}

export async function rejectSponsorshipApplication(input: {
  applicationId: string;
  actorId: string;
  note?: string | null;
}) {
  const application = await getApplicationForMatch(input.applicationId);
  if (["matched", "archived"].includes(application.status)) {
    throw new OrphanSponsorshipWriteError("Bu başvuru mevcut durumda reddedilemez.", "application_reject_invalid");
  }

  const db = getAdminDb();
  const { error } = await db
    .from("sponsorship_applications")
    .update({ status: "rejected", reviewed_by: input.actorId, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", application.id)
    .select("id")
    .single();

  if (error) {
    throw new OrphanSponsorshipWriteError(
      friendlyWriteError(error, "Başvuru reddedildi olarak işaretlenemedi."),
      error.code ?? "application_reject_failed"
    );
  }

  await appendSponsorshipStatusLog({
    applicationId: application.id,
    oldStatus: application.status,
    newStatus: "rejected",
    eventType: "application_rejected",
    actorId: input.actorId,
    actorRole: "admin",
    note: input.note ?? null
  });
}
