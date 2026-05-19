import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAdminDemoMode } from "@/config/admin";
import { normalizeRole } from "@/lib/auth/roleRedirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type AdminProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
};

type AdminAccountRow = {
  id: string;
  auth_user_id: string;
  account_type: string;
  role: string;
  status: string;
};

type QueryResult<T> = Promise<{ data: T | null; error: { code?: string; message?: string } | null }>;
type AdminReadQuery<T> = {
  select: (columns?: string) => AdminReadQuery<T>;
  eq: (column: string, value: string) => AdminReadQuery<T>;
  maybeSingle: () => QueryResult<T>;
};
type AdminReadClient = {
  from: <T>(table: string) => AdminReadQuery<T>;
};

export class AdminAuthorizationError extends Error {
  constructor(
    message = "Bu işlem için yetkili bir admin hesabıyla giriş yapmanız gerekiyor.",
    public code = "admin_required"
  ) {
    super(message);
    this.name = "AdminAuthorizationError";
  }
}

export type AdminContext = {
  user: User;
  supabase: SupabaseClient<Database>;
  role: "super_admin" | "admin";
  profile: AdminProfileRow;
  account: AdminAccountRow | null;
};

function isAdminRole(role: string | null | undefined): role is "super_admin" | "admin" {
  const normalized = normalizeRole(role);
  return normalized === "super_admin" || normalized === "admin";
}

export async function getAdminContext(): Promise<AdminContext> {
  if (isAdminDemoMode) {
    throw new AdminAuthorizationError("Gerçek içerik işlemleri için admin hesabınızla giriş yapmanız gerekiyor.", "demo_mode");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new AdminAuthorizationError("Supabase bağlantısı hazırlanamadı. Lütfen ortam değişkenlerini kontrol edin.", "missing_env");
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AdminAuthorizationError("Bu işlem için önce admin hesabınızla giriş yapmanız gerekiyor.", "auth_required");
  }

  const db = supabase as unknown as AdminReadClient;
  const profileResult = await db
    .from<AdminProfileRow>("profiles")
    .select("id, full_name, email, role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileResult.error || !profileResult.data) {
    throw new AdminAuthorizationError("Admin rolünüz doğrulanamadı. Lütfen yetkili hesabınızla tekrar giriş yapın.", "profile_missing");
  }

  if (profileResult.data.status !== "active") {
    throw new AdminAuthorizationError("Bu admin hesabı aktif görünmüyor. Lütfen yetkili kişiyle iletişime geçin.", "inactive");
  }

  if (!isAdminRole(profileResult.data.role)) {
    throw new AdminAuthorizationError("Bu işlem için admin veya super admin yetkisi gerekiyor.", "forbidden");
  }

  const accountResult = await db
    .from<AdminAccountRow>("user_accounts")
    .select("id, auth_user_id, account_type, role, status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const account = accountResult.error ? null : accountResult.data;

  return {
    user,
    supabase,
    role: normalizeRole(profileResult.data.role) as "super_admin" | "admin",
    profile: profileResult.data,
    account
  };
}

export async function requireAdminUser() {
  return getAdminContext();
}

export async function requireSuperAdmin() {
  const context = await getAdminContext();

  if (context.role !== "super_admin") {
    throw new AdminAuthorizationError("Bu işlem için super admin yetkisi gerekiyor.", "super_admin_required");
  }

  return context;
}

export function canManageContent(context: AdminContext) {
  return context.role === "super_admin" || context.role === "admin";
}
