import type { User } from "@supabase/supabase-js";
import { isAdminDemoMode } from "@/config/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, AuthUser, PanelScope, RouteGuardResult } from "@/types/domain";
import { getDefaultPanelPathForRole, normalizeRole } from "@/lib/auth/roleRedirect";

export const adminRoles: AppRole[] = [
  "super_admin",
  "admin",
  "content_editor",
  "donation_manager",
  "volunteer_coordinator",
  "reporting_manager"
];

export const portalRoles: AppRole[] = ["donor", "bagisci", "volunteer", "gonullu"];
export const coordinatorRoles: AppRole[] = ["coordinator", "koordinator", "volunteer_coordinator"];
export const personnelRoles: AppRole[] = ["staff", "personnel", "personel"];

export function isDemoMode() {
  return isAdminDemoMode;
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? undefined,
    phone: user.phone ?? undefined,
    createdAt: user.created_at
  };
}

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string" && value.trim()) {
    return [value];
  }

  return [];
}

export function getRolesFromUser(user: User | null): AppRole[] {
  if (!user) {
    return [];
  }

  const metadata = {
    ...user.user_metadata,
    ...user.app_metadata
  };

  const candidates = [
    ...readStringArray(metadata.roles),
    ...readStringArray(metadata.role),
    ...readStringArray(metadata.account_type),
    ...readStringArray(metadata.accountType)
  ];

  return candidates.flatMap((role) => {
    const normalized = normalizeRole(role);

    if (normalized === "Bağışçı + Gönüllü") {
      return ["donor", "volunteer"] satisfies AppRole[];
    }

    if (normalized === "Bağışçı") {
      return ["donor"] satisfies AppRole[];
    }

    if (normalized === "Gönüllü") {
      return ["volunteer"] satisfies AppRole[];
    }

    return normalized ? [normalized as AppRole] : [];
  });
}

export function hasAnyRole(currentRoles: AppRole[], allowedRoles: AppRole[]) {
  return currentRoles.some((role) => allowedRoles.includes(role));
}

export function getAllowedRolesForScope(scope: PanelScope): AppRole[] {
  switch (scope) {
    case "admin":
      return adminRoles;
    case "portal":
      return portalRoles;
    case "coordinator":
      return coordinatorRoles;
    case "personnel":
      return personnelRoles;
  }
}

export function getLoginPathForScope(scope: PanelScope) {
  return scope === "admin" ? "/admin/giris" : "/giris";
}

export function getRouteScope(pathname: string): PanelScope | null {
  if (pathname === "/admin/giris") {
    return null;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return "admin";
  }

  if (pathname === "/panel" || pathname.startsWith("/panel/")) {
    return "portal";
  }

  if (pathname === "/koordinator" || pathname.startsWith("/koordinator/")) {
    return "coordinator";
  }

  if (pathname === "/personel" || pathname.startsWith("/personel/")) {
    return "personnel";
  }

  return null;
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

export async function getCurrentAccount() {
  // TODO: 8D aşamasında `user_accounts` tablosundan authenticated ownership policy ile okunacak.
  return null;
}

export async function getCurrentRoles() {
  return getRolesFromUser(await getCurrentUser());
}

export async function requireAnyRole(allowedRoles: AppRole[]): Promise<RouteGuardResult> {
  if (isDemoMode()) {
    return { allowed: true, mode: "demo", reason: "Demo mod aktif; route guard önizleme için açık." };
  }

  if (!isSupabaseConfigured()) {
    return { allowed: false, mode: "missing_env", reason: "Supabase env değişkenleri eksik.", loginPath: "/giris" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { allowed: false, mode: "auth_required", reason: "Oturum bulunamadı.", loginPath: "/giris" };
  }

  const roles = getRolesFromUser(user);
  if (!hasAnyRole(roles, allowedRoles)) {
    return { allowed: false, mode: "forbidden", reason: "Bu panele erişim yetkiniz yok.", loginPath: "/giris" };
  }

  return { allowed: true, mode: "authenticated", user: toAuthUser(user), roles, redirectTo: getDefaultPanelPathForRole(roles[0]) };
}

export async function requirePanelAccess(scope: PanelScope) {
  return requireAnyRole(getAllowedRolesForScope(scope));
}

export async function canAccessModule(moduleName: string, action: string) {
  if (isDemoMode()) {
    return true;
  }

  // TODO: `role_permissions` tablosu authenticated role policy ile açıldığında gerçek modül yetkisi kontrol edilecek.
  return Boolean(moduleName && action);
}

export async function getRouteGuardState(pathname: string) {
  const scope = getRouteScope(pathname);

  return {
    demoMode: isDemoMode(),
    supabaseConfigured: isSupabaseConfigured(),
    scope,
    loginPath: scope ? getLoginPathForScope(scope) : "/giris",
    allowedRoles: scope ? getAllowedRolesForScope(scope) : []
  };
}
