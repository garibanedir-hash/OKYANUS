import "server-only";

import {
  mockDonorSponsoredOrphans,
  mockOrphanAssignments,
  mockOrphanProfiles,
  mockOrphanUpdates,
  mockSponsorshipNotifications,
  mockSponsorshipPayments,
  mockSponsorshipPrograms,
  mockSponsorshipStats,
  mockSponsorships,
  orphanAssignmentStatusLabels,
  orphanProfileStatusLabels,
  orphanUpdateStatusLabels,
  sponsorshipPaymentStatusLabels,
  sponsorshipProgramStatusLabels,
  sponsorshipStatusLabels,
  type DonorSponsoredOrphan,
  type OrphanAssignment,
  type OrphanAssignmentStatus,
  type OrphanProfile,
  type OrphanProfileStatus,
  type OrphanUpdate,
  type OrphanUpdateStatus,
  type Sponsorship,
  type SponsorshipNotification,
  type SponsorshipPayment,
  type SponsorshipPaymentStatus,
  type SponsorshipProgram,
  type SponsorshipProgramStatus,
  type SponsorshipStats,
  type SponsorshipStatus
} from "@/data/orphanSponsorshipMock";
import {
  createReadOnlyAbortSignal,
  createSupabaseReadOnlyClient,
  logReadOnlyFallback,
  type RepositoryResult
} from "@/lib/data/readOnlySupabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProgramRow = {
  id: string;
  slug: string;
  title: string;
  monthly_amount: number | string | null;
  currency: string | null;
  country: string | null;
  region: string | null;
  description: string | null;
  short_description: string | null;
  status: SponsorshipProgramStatus;
  start_date: string | null;
  end_date: string | null;
  transparency_note: string | null;
  updated_at: string | null;
};

type OrphanRow = {
  id: string;
  code: string;
  display_name: string;
  safe_name: string | null;
  gender: string | null;
  birth_year: number | null;
  age_group: string | null;
  country: string | null;
  city_or_region: string | null;
  education_status: string | null;
  general_health_note: string | null;
  family_status_summary: string | null;
  sponsorship_need_amount: number | string | null;
  currency: string | null;
  status: OrphanProfileStatus;
  visibility_level: string | null;
  photo_url: string | null;
  internal_notes: string | null;
  updated_at: string | null;
};

type SponsorshipRow = {
  id: string;
  sponsorship_no: string;
  sponsor_account_id: string | null;
  sponsor_name: string | null;
  sponsor_email: string | null;
  sponsor_phone: string | null;
  orphan_id: string | null;
  program_id: string | null;
  monthly_amount: number | string | null;
  currency: string | null;
  start_date: string | null;
  end_date: string | null;
  status: SponsorshipStatus;
  payment_status: SponsorshipPaymentStatus;
  last_payment_date: string | null;
  next_payment_date: string | null;
  note: string | null;
  updated_at: string | null;
  orphan_profiles?: { code?: string | null; safe_name?: string | null; display_name?: string | null } | Array<{ code?: string | null; safe_name?: string | null; display_name?: string | null }> | null;
  sponsorship_programs?: { title?: string | null } | Array<{ title?: string | null }> | null;
};

type PaymentRow = {
  id: string;
  sponsorship_id: string | null;
  amount: number | string | null;
  currency: string | null;
  status: SponsorshipPaymentStatus;
  payment_date: string | null;
  provider: string | null;
  provider_reference: string | null;
  receipt_status: string | null;
  created_at: string | null;
  sponsorships?: { sponsorship_no?: string | null } | Array<{ sponsorship_no?: string | null }> | null;
};

type UpdateRow = {
  id: string;
  orphan_id: string | null;
  sponsorship_id: string | null;
  title: string;
  summary: string | null;
  content: string | null;
  update_type: string | null;
  status: OrphanUpdateStatus;
  published_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  orphan_profiles?: { code?: string | null } | Array<{ code?: string | null }> | null;
};

type AssignmentRow = {
  id: string;
  orphan_id: string | null;
  sponsorship_id: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  assignment_type: string | null;
  status: OrphanAssignmentStatus;
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  updated_at: string | null;
  orphan_profiles?: { code?: string | null } | Array<{ code?: string | null }> | null;
  sponsorships?: { sponsorship_no?: string | null } | Array<{ sponsorship_no?: string | null }> | null;
};

type SafeOrphanRow = {
  orphan_id: string;
  code: string;
  safe_name: string | null;
  age_group: string | null;
  country: string | null;
  city_or_region: string | null;
  education_status: string | null;
  general_health_note: string | null;
  sponsorship_status: SponsorshipStatus;
  sponsor_account_id: string | null;
  sponsorship_id: string;
};

type AuthenticatedReadClient = {
  from: <T>(table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: string) => AuthenticatedQuery<T>;
      order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => AuthenticatedQuery<T>;
      abortSignal: (signal: AbortSignal) => Promise<{ data: T[] | null; error: { code?: string; message?: string } | null }>;
    };
  };
};

type AuthenticatedQuery<T> = {
  eq: (column: string, value: string) => AuthenticatedQuery<T>;
  order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => AuthenticatedQuery<T>;
  abortSignal: (signal: AbortSignal) => Promise<{ data: T[] | null; error: { code?: string; message?: string } | null }>;
};

const programColumns = [
  "id",
  "slug",
  "title",
  "monthly_amount",
  "currency",
  "country",
  "region",
  "description",
  "short_description",
  "status",
  "start_date",
  "end_date",
  "transparency_note",
  "updated_at"
].join(", ");

const orphanColumns = [
  "id",
  "code",
  "display_name",
  "safe_name",
  "gender",
  "birth_year",
  "age_group",
  "country",
  "city_or_region",
  "education_status",
  "general_health_note",
  "family_status_summary",
  "sponsorship_need_amount",
  "currency",
  "status",
  "visibility_level",
  "photo_url",
  "internal_notes",
  "updated_at"
].join(", ");

const sponsorshipColumns = [
  "id",
  "sponsorship_no",
  "sponsor_account_id",
  "sponsor_name",
  "sponsor_email",
  "sponsor_phone",
  "orphan_id",
  "program_id",
  "monthly_amount",
  "currency",
  "start_date",
  "end_date",
  "status",
  "payment_status",
  "last_payment_date",
  "next_payment_date",
  "note",
  "updated_at",
  "orphan_profiles(code, safe_name, display_name)",
  "sponsorship_programs(title)"
].join(", ");

function parseNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function maskEmail(value: string | null | undefined) {
  if (!value || !value.includes("@")) return "s***@example.org";
  const [name, domain] = value.split("@");
  return `${name.slice(0, 1) || "s"}***@${domain}`;
}

function maskPhone(value: string | null | undefined) {
  if (!value) return "+90 5** *** ** **";
  return value.replace(/\d(?=\d{2})/g, "*");
}

function maskName(value: string | null | undefined) {
  if (!value) return "S***";
  return `${value.slice(0, 1)}***`;
}

function mapProgram(row: ProgramRow): SponsorshipProgram {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    monthlyAmount: parseNumber(row.monthly_amount),
    currency: row.currency ?? "TRY",
    country: row.country ?? "Bölge güncellenecek",
    region: row.region ?? "Saha bilgisi güncellenecek",
    description: row.description ?? row.short_description ?? "Yetim hamiliği program açıklaması güncellenecek.",
    shortDescription: row.short_description ?? "Yetim hamiliği program açıklaması güncellenecek.",
    status: row.status,
    statusLabel: sponsorshipProgramStatusLabels[row.status],
    startDate: row.start_date ?? "Tarih güncellenecek",
    endDate: row.end_date ?? undefined,
    transparencyNote: row.transparency_note ?? "Çocuk mahremiyeti korunarak sınırlı bilgi paylaşılır.",
    updatedAt: row.updated_at ?? "Tarih güncellenecek"
  };
}

function mapOrphan(row: OrphanRow): OrphanProfile {
  return {
    id: row.id,
    code: row.code,
    displayName: maskName(row.display_name),
    safeName: row.safe_name ?? "Güvenli profil adı",
    gender: row.gender ?? "Paylaşılmıyor",
    birthYear: row.birth_year ?? undefined,
    ageGroup: row.age_group ?? "Güvenli yaş grubu",
    country: row.country ?? "Bölge bilgisi sınırlı",
    cityOrRegion: row.city_or_region ?? "Bölge bilgisi sınırlı",
    educationStatus: row.education_status ?? "Eğitim bilgisi sınırlı",
    generalHealthNote: row.general_health_note ?? "Hassas sağlık detayı paylaşılmaz.",
    familyStatusSummary: row.family_status_summary ?? "Sınırlı sosyal destek özeti",
    sponsorshipNeedAmount: parseNumber(row.sponsorship_need_amount),
    currency: row.currency ?? "TRY",
    status: row.status,
    statusLabel: orphanProfileStatusLabels[row.status],
    visibilityLevel: row.visibility_level ?? "limited",
    photoUrl: row.photo_url ?? undefined,
    internalNotes: row.internal_notes ?? "",
    updatedAt: row.updated_at ?? "Tarih güncellenecek"
  };
}

function mapSponsorship(row: SponsorshipRow): Sponsorship {
  const orphan = firstRelation(row.orphan_profiles);
  const program = firstRelation(row.sponsorship_programs);

  return {
    id: row.id,
    sponsorshipNo: row.sponsorship_no,
    sponsorAccountId: row.sponsor_account_id ?? "",
    sponsorDisplayName: maskName(row.sponsor_name),
    sponsorEmailMasked: maskEmail(row.sponsor_email),
    sponsorPhoneMasked: maskPhone(row.sponsor_phone),
    orphanId: row.orphan_id ?? "",
    orphanCode: orphan?.code ?? "YTM-****",
    orphanSafeName: orphan?.safe_name ?? orphan?.display_name ?? "Güvenli profil adı",
    programId: row.program_id ?? "",
    programTitle: program?.title ?? "Yetim hamiliği programı",
    monthlyAmount: parseNumber(row.monthly_amount),
    currency: row.currency ?? "TRY",
    startDate: row.start_date ?? "Tarih güncellenecek",
    endDate: row.end_date ?? undefined,
    status: row.status,
    statusLabel: sponsorshipStatusLabels[row.status],
    paymentStatus: row.payment_status,
    paymentStatusLabel: sponsorshipPaymentStatusLabels[row.payment_status],
    lastPaymentDate: row.last_payment_date ?? undefined,
    nextPaymentDate: row.next_payment_date ?? undefined,
    receiptStatus: row.payment_status === "paid" ? "Makbuz sonraki aşama" : "Ödeme bekleniyor",
    note: row.note ?? "",
    updatedAt: row.updated_at ?? "Tarih güncellenecek"
  };
}

function mapPayment(row: PaymentRow): SponsorshipPayment {
  const sponsorship = firstRelation(row.sponsorships);

  return {
    id: row.id,
    sponsorshipId: row.sponsorship_id ?? "",
    sponsorshipNo: sponsorship?.sponsorship_no ?? "YSP-****",
    amount: parseNumber(row.amount),
    currency: row.currency ?? "TRY",
    status: row.status,
    statusLabel: sponsorshipPaymentStatusLabels[row.status],
    paymentDate: row.payment_date ?? undefined,
    provider: row.provider ?? undefined,
    providerReference: row.provider_reference ? "masked-reference" : undefined,
    receiptStatus: row.receipt_status ?? "Makbuz sonraki aşama",
    createdAt: row.created_at ?? "Tarih güncellenecek"
  };
}

function mapUpdate(row: UpdateRow): OrphanUpdate {
  const orphan = firstRelation(row.orphan_profiles);

  return {
    id: row.id,
    orphanId: row.orphan_id ?? "",
    orphanCode: orphan?.code ?? "YTM-****",
    sponsorshipId: row.sponsorship_id ?? undefined,
    title: row.title,
    summary: row.summary ?? "Güvenli güncelleme özeti",
    content: row.content ?? "Hassas detay içermeyen güvenli içerik.",
    updateType: row.update_type ?? "Güvenli özet",
    status: row.status,
    statusLabel: orphanUpdateStatusLabels[row.status],
    publishedAt: row.published_at ?? undefined,
    createdBy: row.created_by ? "Yetkili kullanıcı" : "Sistem",
    updatedAt: row.updated_at ?? "Tarih güncellenecek"
  };
}

function mapAssignment(row: AssignmentRow): OrphanAssignment {
  const orphan = firstRelation(row.orphan_profiles);
  const sponsorship = firstRelation(row.sponsorships);

  return {
    id: row.id,
    orphanId: row.orphan_id ?? "",
    orphanCode: orphan?.code ?? "YTM-****",
    sponsorshipId: row.sponsorship_id ?? undefined,
    sponsorshipNo: sponsorship?.sponsorship_no ?? undefined,
    assignedTo: row.assigned_to ?? "",
    assignedToName: "Yetkili ekip hesabı",
    assignedBy: row.assigned_by ? "Yetkili kullanıcı" : "Sistem",
    assignmentType: row.assignment_type ?? "Yetim hamiliği takibi",
    status: row.status,
    statusLabel: orphanAssignmentStatusLabels[row.status],
    dueDate: row.due_date ?? undefined,
    completedAt: row.completed_at ?? undefined,
    notes: row.notes ?? "",
    updatedAt: row.updated_at ?? "Tarih güncellenecek"
  };
}

function mapSafeOrphan(row: SafeOrphanRow): DonorSponsoredOrphan {
  return {
    orphanId: row.orphan_id,
    code: row.code,
    safeName: row.safe_name ?? "Güvenli profil adı",
    ageGroup: row.age_group ?? "Güvenli yaş grubu",
    country: row.country ?? "Bölge bilgisi sınırlı",
    cityOrRegion: row.city_or_region ?? "Bölge bilgisi sınırlı",
    educationStatus: row.education_status ?? "Eğitim bilgisi sınırlı",
    generalHealthNote: row.general_health_note ?? "Hassas sağlık detayı paylaşılmaz.",
    sponsorshipStatus: row.sponsorship_status,
    sponsorshipStatusLabel: sponsorshipStatusLabels[row.sponsorship_status],
    sponsorAccountId: row.sponsor_account_id ?? "",
    sponsorshipId: row.sponsorship_id
  };
}

async function createAuthenticatedReadClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return supabase as unknown as AuthenticatedReadClient;
}

async function fetchActivePrograms() {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("sponsorship_programs")
      .select(programColumns)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("sponsorship-programs", error);
      return null;
    }

    return (data ?? []).map((row) => mapProgram(row as unknown as ProgramRow));
  } catch {
    logReadOnlyFallback("sponsorship-programs");
    return null;
  } finally {
    timeout.clear();
  }
}

async function fetchProgramBySlug(slug: string) {
  const programs = await fetchActivePrograms();
  return programs?.find((program) => program.slug === slug) ?? null;
}

async function fetchAuthenticatedRows<T>(table: string, columns: string, orderColumn: string) {
  const supabase = await createAuthenticatedReadClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from<T>(table)
      .select(columns)
      .order(orderColumn, { ascending: false })
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback(table, error);
      return null;
    }

    return data ?? [];
  } catch {
    logReadOnlyFallback(table);
    return null;
  } finally {
    timeout.clear();
  }
}

async function fetchAdminOrphans() {
  const rows = await fetchAuthenticatedRows<OrphanRow>("orphan_profiles", orphanColumns, "updated_at");
  return rows?.map((row) => mapOrphan(row)) ?? null;
}

async function fetchAdminSponsorships() {
  const rows = await fetchAuthenticatedRows<SponsorshipRow>("sponsorships", sponsorshipColumns, "updated_at");
  return rows?.map((row) => mapSponsorship(row)) ?? null;
}

async function fetchAdminPayments() {
  const rows = await fetchAuthenticatedRows<PaymentRow>(
    "sponsorship_payments",
    "id, sponsorship_id, amount, currency, status, payment_date, provider, provider_reference, receipt_status, created_at, sponsorships(sponsorship_no)",
    "created_at"
  );
  return rows?.map((row) => mapPayment(row)) ?? null;
}

async function fetchAdminUpdates() {
  const rows = await fetchAuthenticatedRows<UpdateRow>(
    "orphan_updates",
    "id, orphan_id, sponsorship_id, title, summary, content, update_type, status, published_at, created_by, updated_at, orphan_profiles(code)",
    "updated_at"
  );
  return rows?.map((row) => mapUpdate(row)) ?? null;
}

async function fetchAdminAssignments() {
  const rows = await fetchAuthenticatedRows<AssignmentRow>(
    "orphan_assignments",
    "id, orphan_id, sponsorship_id, assigned_to, assigned_by, assignment_type, status, due_date, completed_at, notes, updated_at, orphan_profiles(code), sponsorships(sponsorship_no)",
    "updated_at"
  );
  return rows?.map((row) => mapAssignment(row)) ?? null;
}

async function fetchSafeOrphans() {
  const rows = await fetchAuthenticatedRows<SafeOrphanRow>(
    "sponsored_orphans_safe_view",
    "orphan_id, code, safe_name, age_group, country, city_or_region, education_status, general_health_note, sponsorship_status, sponsor_account_id, sponsorship_id",
    "code"
  );
  return rows?.map((row) => mapSafeOrphan(row)) ?? null;
}

export async function getActiveSponsorshipPrograms(): Promise<SponsorshipProgram[]> {
  return (await fetchActivePrograms()) ?? mockSponsorshipPrograms.filter((program) => program.status === "active");
}

export async function getActiveSponsorshipProgramsWithSource(): Promise<RepositoryResult<SponsorshipProgram[]>> {
  const programs = await fetchActivePrograms();
  if (programs) return { data: programs, source: "supabase" };
  return { data: mockSponsorshipPrograms.filter((program) => program.status === "active"), source: "demo" };
}

export async function getSponsorshipProgramBySlug(slug: string): Promise<SponsorshipProgram | undefined> {
  return (await fetchProgramBySlug(slug)) ?? mockSponsorshipPrograms.find((program) => program.slug === slug && program.status === "active");
}

export async function getAdminSponsorshipStats(): Promise<SponsorshipStats> {
  const [orphans, sponsorships, updates, assignments] = await Promise.all([
    fetchAdminOrphans(),
    fetchAdminSponsorships(),
    fetchAdminUpdates(),
    fetchAdminAssignments()
  ]);

  if (!orphans || !sponsorships || !updates || !assignments) return mockSponsorshipStats;

  const countryCounts = orphans.reduce<Record<string, number>>((acc, orphan) => {
    acc[orphan.country] = (acc[orphan.country] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalOrphans: orphans.length,
    waitingForSponsor: orphans.filter((orphan) => ["active", "waiting"].includes(orphan.status)).length,
    activeSponsorships: sponsorships.filter((item) => item.status === "active").length,
    paymentPending: sponsorships.filter((item) => item.paymentStatus === "pending").length,
    updatesPending: updates.filter((item) => item.status === "draft").length,
    assignmentsPending: assignments.filter((item) => ["assigned", "in_progress"].includes(item.status)).length,
    countryBreakdown: Object.entries(countryCounts).map(([label, value]) => ({ label, value })),
    statusBreakdown: [
      { label: "Sponsorlu", value: orphans.filter((orphan) => orphan.status === "sponsored").length },
      { label: "Sponsor bekliyor", value: orphans.filter((orphan) => ["active", "waiting"].includes(orphan.status)).length }
    ]
  };
}

export async function getAdminOrphanProfiles(): Promise<OrphanProfile[]> {
  return (await fetchAdminOrphans()) ?? mockOrphanProfiles;
}

export async function getAdminSponsorships(): Promise<Sponsorship[]> {
  return (await fetchAdminSponsorships()) ?? mockSponsorships;
}

export async function getAdminSponsorshipPayments(): Promise<SponsorshipPayment[]> {
  return (await fetchAdminPayments()) ?? mockSponsorshipPayments;
}

export async function getAdminOrphanUpdates(): Promise<OrphanUpdate[]> {
  return (await fetchAdminUpdates()) ?? mockOrphanUpdates;
}

export async function getAdminOrphanAssignments(): Promise<OrphanAssignment[]> {
  return (await fetchAdminAssignments()) ?? mockOrphanAssignments;
}

export async function getAdminSponsorshipNotifications(): Promise<SponsorshipNotification[]> {
  return mockSponsorshipNotifications;
}

export async function getDonorSponsorships(accountId: string): Promise<Sponsorship[]> {
  const sponsorships = await fetchAdminSponsorships();
  const source = sponsorships ?? mockSponsorships;
  return source.filter((item) => item.sponsorAccountId === accountId);
}

export async function getDonorSponsoredOrphans(accountId: string): Promise<DonorSponsoredOrphan[]> {
  const safeOrphans = await fetchSafeOrphans();
  const source = safeOrphans ?? mockDonorSponsoredOrphans;
  return source.filter((item) => item.sponsorAccountId === accountId);
}

export async function getCoordinatorOrphanAssignments(accountId: string): Promise<OrphanAssignment[]> {
  const assignments = await fetchAdminAssignments();
  const source = assignments ?? mockOrphanAssignments;
  return source.filter((item) => item.assignedTo === accountId || item.assignedTo === "demo-coordinator-account");
}

export async function getStaffOrphanAssignments(accountId: string): Promise<OrphanAssignment[]> {
  const assignments = await fetchAdminAssignments();
  const source = assignments ?? mockOrphanAssignments;
  return source.filter((item) => item.assignedTo === accountId || item.assignedTo === "demo-staff-account");
}
