import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminAuthorizationError, requireAdminUser } from "@/lib/auth/requireAdmin";

export type ManagedUserRole = "super_admin" | "admin" | "coordinator" | "staff";
export type ManagedUserStatus = "active" | "inactive";

export type ManagedUserAccount = {
  id: string;
  authUserId: string | null;
  fullName: string;
  email: string;
  accountType: string;
  role: ManagedUserRole | string;
  status: string;
  unit: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

type QueryError = { code?: string; message?: string };
type QueryResult<T> = Promise<{ data: T | null; error: QueryError | null }>;
type QueryManyResult<T> = Promise<{ data: T[] | null; error: QueryError | null }>;
type ReadQueryBuilder<T> = {
  select: (columns?: string) => ReadQueryBuilder<T>;
  eq: (column: string, value: string) => ReadQueryBuilder<T>;
  order: (column: string, options?: { ascending?: boolean }) => QueryManyResult<T>;
  maybeSingle: () => QueryResult<T>;
};
type WriteQueryBuilder<T> = {
  select: (columns?: string) => ReadQueryBuilder<T>;
  eq: (column: string, value: string) => ReadQueryBuilder<T>;
};
type AdminDbClient = {
  from: <T>(table: string) => {
    select: (columns?: string) => ReadQueryBuilder<T>;
    insert: (values: Record<string, unknown> | Array<Record<string, unknown>>) => WriteQueryBuilder<T>;
    upsert: (values: Record<string, unknown> | Array<Record<string, unknown>>, options?: { onConflict?: string }) => WriteQueryBuilder<T>;
    update: (values: Record<string, unknown>) => WriteQueryBuilder<T>;
  };
};

type UserAccountRow = {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  account_type: string;
  role: string;
  status: string;
  profile_completion: number;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
};

export const managedUserRoles: Array<{ value: ManagedUserRole; label: string; accountType: string }> = [
  { value: "admin", label: "Admin", accountType: "Admin" },
  { value: "coordinator", label: "Koordinatör", accountType: "Koordinatör" },
  { value: "staff", label: "Personel", accountType: "Personel" }
];

export const managedUserStatusOptions: Array<{ value: ManagedUserStatus; label: string }> = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Pasif" }
];

function db() {
  const client = createSupabaseAdminClient();
  return client ? (client as unknown as AdminDbClient) : null;
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseManagedUserForm(formData: FormData) {
  const fullName = normalizeText(formData.get("fullName"));
  const email = normalizeText(formData.get("email")).toLowerCase();
  const role = normalizeText(formData.get("role")) as ManagedUserRole;
  const unit = normalizeText(formData.get("unit"));
  const status = normalizeText(formData.get("status")) as ManagedUserStatus;
  const note = normalizeText(formData.get("note"));

  return { fullName, email, role, unit, status, note };
}

function isManagedUserRole(role: string): role is ManagedUserRole {
  return role === "super_admin" || role === "admin" || role === "coordinator" || role === "staff";
}

function isManagedUserStatus(status: string): status is ManagedUserStatus {
  return status === "active" || status === "inactive";
}

export function validateManagedUserInput(input: ReturnType<typeof parseManagedUserForm>) {
  if (input.fullName.length < 3) {
    return "Ad soyad en az 3 karakter olmalıdır.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return "Geçerli bir e-posta adresi girin.";
  }

  if (!isManagedUserRole(input.role) || input.role === "super_admin") {
    return "Geçerli bir rol seçin.";
  }

  if (!isManagedUserStatus(input.status)) {
    return "Geçerli bir durum seçin.";
  }

  return null;
}

function getAccountTypeForRole(role: ManagedUserRole) {
  return managedUserRoles.find((item) => item.value === role)?.accountType ?? "Personel";
}

function mapManagedUser(row: UserAccountRow): ManagedUserAccount {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    fullName: row.full_name,
    email: row.email,
    accountType: row.account_type,
    role: row.role,
    status: row.status,
    unit: row.city ?? "",
    note: row.phone ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listManagedUsers(): Promise<{ users: ManagedUserAccount[]; error?: string }> {
  const client = db();

  if (!client) {
    return { users: [], error: "Kullanıcı kayıtları şu anda okunamıyor. Lütfen giriş yapılandırmasını kontrol edin." };
  }

  const result = await client
    .from<UserAccountRow>("user_accounts")
    .select("id, auth_user_id, full_name, email, phone, city, account_type, role, status, profile_completion, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (result.error) {
    console.warn("[admin-users:list]", { code: result.error.code, message: result.error.message });
    return { users: [], error: "Kullanıcı kayıtları okunamadı. Lütfen daha sonra tekrar deneyin." };
  }

  return {
    users: (result.data ?? [])
      .filter((row) => ["Admin", "Koordinatör", "Personel"].includes(row.account_type))
      .map(mapManagedUser)
  };
}

async function findExistingUserAccount(client: AdminDbClient, email: string) {
  return client
    .from<UserAccountRow>("user_accounts")
    .select("id, auth_user_id, full_name, email, account_type, role, status, created_at, updated_at")
    .eq("email", email)
    .maybeSingle();
}

async function ensureAdminProfile(client: AdminDbClient, user: User, input: ReturnType<typeof parseManagedUserForm>) {
  if (input.role !== "admin") {
    return;
  }

  const profilePayload = {
    id: user.id,
    full_name: input.fullName,
    email: input.email,
    role: "admin",
    status: input.status,
    updated_at: new Date().toISOString()
  };

  const profileResult = await client
    .from<ProfileRow>("profiles")
    .upsert(profilePayload, { onConflict: "id" })
    .select("id, full_name, email, role, status")
    .maybeSingle();

  if (profileResult.error) {
    console.warn("[admin-users:profile-upsert]", { code: profileResult.error.code, message: profileResult.error.message });
    throw new Error("Admin profil kaydı oluşturulamadı.");
  }
}

export async function inviteManagedUser(formData: FormData) {
  const admin = await requireAdminUser();

  if (admin.role !== "super_admin" && admin.role !== "admin") {
    throw new AdminAuthorizationError("Bu işlem için admin yetkisi gerekiyor.", "forbidden");
  }

  const input = parseManagedUserForm(formData);
  const validationError = validateManagedUserInput(input);

  if (validationError) {
    return { ok: false, message: validationError };
  }

  const client = createSupabaseAdminClient();
  const database = client ? (client as unknown as AdminDbClient) : null;

  if (!client || !database) {
    return { ok: false, message: "Kullanıcı oluşturma yapılandırması hazır değil." };
  }

  const existingAccount = await findExistingUserAccount(database, input.email);
  if (existingAccount.data) {
    return { ok: false, message: "Bu e-posta ile kayıtlı bir kullanıcı zaten var." };
  }

  if (existingAccount.error && existingAccount.error.code !== "PGRST116") {
    console.warn("[admin-users:existing-account]", { code: existingAccount.error.code, message: existingAccount.error.message });
    return { ok: false, message: "E-posta kontrolü tamamlanamadı. Lütfen tekrar deneyin." };
  }

  const inviteResult = await client.auth.admin.inviteUserByEmail(input.email, {
    data: {
      full_name: input.fullName,
      role: input.role,
      account_type: getAccountTypeForRole(input.role)
    }
  });

  if (inviteResult.error || !inviteResult.data.user) {
    const message = inviteResult.error?.message ?? "";
    console.warn("[admin-users:invite]", { message });

    if (/already|registered|exists|duplicate/i.test(message)) {
      return { ok: false, message: "Bu e-posta ile kayıtlı bir kullanıcı zaten var." };
    }

    return { ok: false, message: "Kullanıcı daveti gönderilemedi. Lütfen bilgileri kontrol ederek tekrar deneyin." };
  }

  const user = inviteResult.data.user;
  const accountPayload = {
    auth_user_id: user.id,
    full_name: input.fullName,
    email: input.email,
    phone: input.note,
    city: input.unit,
    account_type: getAccountTypeForRole(input.role),
    role: input.role,
    status: input.status,
    profile_completion: input.unit ? 60 : 40,
    updated_at: new Date().toISOString()
  };

  const accountResult = await database
    .from<UserAccountRow>("user_accounts")
    .upsert(accountPayload, { onConflict: "auth_user_id" })
    .select("id, auth_user_id, full_name, email, phone, city, account_type, role, status, profile_completion, created_at, updated_at")
    .maybeSingle();

  if (accountResult.error || !accountResult.data) {
    console.warn("[admin-users:account-upsert]", { code: accountResult.error?.code, message: accountResult.error?.message });
    return { ok: false, message: "Kullanıcı panel kaydı oluşturulamadı. Lütfen tekrar deneyin." };
  }

  await ensureAdminProfile(database, user, input);

  return { ok: true, message: "Kullanıcı daveti oluşturuldu." };
}

export async function setManagedUserStatus(userAccountId: string, status: ManagedUserStatus) {
  const admin = await requireAdminUser();

  if (admin.role !== "super_admin" && admin.role !== "admin") {
    throw new AdminAuthorizationError("Bu işlem için admin yetkisi gerekiyor.", "forbidden");
  }

  if (!isManagedUserStatus(status)) {
    return { ok: false, message: "Geçerli bir durum seçin." };
  }

  const client = db();
  if (!client) {
    return { ok: false, message: "Kullanıcı durumu güncellenemedi." };
  }

  const result = await client
    .from<UserAccountRow>("user_accounts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", userAccountId)
    .select("id, auth_user_id, full_name, email, phone, city, account_type, role, status, profile_completion, created_at, updated_at")
    .maybeSingle();

  if (result.error) {
    console.warn("[admin-users:status-update]", { code: result.error.code, message: result.error.message });
    return { ok: false, message: "Kullanıcı durumu güncellenemedi. Lütfen tekrar deneyin." };
  }

  return { ok: true, message: status === "active" ? "Kullanıcı aktif hale getirildi." : "Kullanıcı pasif hale getirildi." };
}
