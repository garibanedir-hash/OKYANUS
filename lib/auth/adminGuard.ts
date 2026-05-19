import type { User } from "@supabase/supabase-js";
import { adminAuthEnabled, isAdminDemoMode } from "@/config/admin";
import { adminRoles, getRolesForUser } from "@/lib/auth/routeGuard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminGuardResult, AdminPermission, SupabaseProfile } from "@/types/domain";

export function isDemoMode() {
  return isAdminDemoMode;
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

export async function getCurrentUser(): Promise<User | null> {
  if (isDemoMode() || !isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentAdminProfile(): Promise<SupabaseProfile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const roles = await getRolesForUser(user);
  const role = roles.find((currentRole) => adminRoles.includes(currentRole));

  if (!role) {
    return null;
  }

  // TODO: 8D sonrası profiles/admin_roles tablosundan full profile alanları read-only doğrulanacak.
  return {
    id: user.id,
    fullName: user.email ?? "Admin Kullanıcı",
    email: user.email ?? "",
    role,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function hasAdminRole(profile: SupabaseProfile | null, allowedRoles: AdminPermission[] = []) {
  if (isDemoMode()) {
    return true;
  }

  if (!profile) {
    return false;
  }

  if (!allowedRoles.length) {
    return true;
  }

  return allowedRoles.includes(profile.role);
}

export async function requireAdmin(allowedRoles: AdminPermission[] = []): Promise<AdminGuardResult> {
  if (isDemoMode()) {
    return { allowed: true, mode: "demo", reason: "Admin demo modu aktif." };
  }

  if (!isSupabaseConfigured()) {
    return { allowed: false, mode: "missing_env", reason: "Supabase env değişkenleri eksik." };
  }

  const profile = await getCurrentAdminProfile();

  if (!profile) {
    return { allowed: false, mode: "auth_required", reason: "Admin oturumu bulunamadı." };
  }

  if (!hasAdminRole(profile, allowedRoles)) {
    return { allowed: false, mode: "forbidden", reason: "Bu alana erişmek için yetkili hesabınızla giriş yapmanız gerekiyor." };
  }

  return { allowed: true, mode: "authenticated", profile };
}

export async function getAdminGuardState() {
  return {
    demoMode: isDemoMode(),
    authEnabled: adminAuthEnabled,
    supabaseConfigured: isSupabaseConfigured(),
    user: await getCurrentUser()
  };
}
