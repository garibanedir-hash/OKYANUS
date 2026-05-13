import type { User } from "@supabase/supabase-js";
import { isAdminDemoMode } from "@/config/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, AuthAccount, AuthUser, PanelScope, PermissionAction, PermissionModule, RolePermission, RouteGuardResult } from "@/types/domain";
import { getDefaultPanelPathForRole, normalizeRole } from "@/lib/auth/roleRedirect";

type QueryResult<T> = Promise<{ data: T | null; error: { message?: string; code?: string } | null }>;

type ReadOnlyQueryBuilder<T> = {
  select: (columns?: string) => ReadOnlyQueryBuilder<T>;
  eq: (column: string, value: string | boolean) => ReadOnlyQueryBuilder<T>;
  in: (column: string, values: string[]) => ReadOnlyQueryBuilder<T>;
  limit: (count: number) => ReadOnlyQueryBuilder<T>;
  maybeSingle: () => QueryResult<T>;
  then: Promise<{ data: T[] | null; error: { message?: string; code?: string } | null }>["then"];
};

type ReadOnlySupabaseClient = {
  from: <T>(table: string) => ReadOnlyQueryBuilder<T>;
};

type UserAccountRow = {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  account_type: string;
  role: string;
  status: string;
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
};

type RolePermissionRow = {
  role: string;
  permission_module: string;
  permission_action: string;
  allowed: boolean;
};

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
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return getAccountForUser(user);
}

export async function getAccountForUser(user: User): Promise<AuthAccount | null> {
  if (isDemoMode() || !isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const db = supabase as unknown as ReadOnlySupabaseClient;
  const { data, error } = await db
    .from<UserAccountRow>("user_accounts")
    .select("id, auth_user_id, full_name, email, account_type, role, status")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    authUserId: data.auth_user_id,
    fullName: data.full_name,
    email: data.email,
    accountType: data.account_type,
    role: data.role,
    status: data.status
  };
}

async function getProfileRolesForUser(user: User): Promise<AppRole[]> {
  if (isDemoMode() || !isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const db = supabase as unknown as ReadOnlySupabaseClient;
  const { data, error } = await db
    .from<ProfileRow>("profiles")
    .select("id, full_name, email, role, status")
    .eq("id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    return [];
  }

  const normalized = normalizeRole(data.role);
  return normalized && normalized !== "Bağışçı" && normalized !== "Gönüllü" && normalized !== "Bağışçı + Gönüllü"
    ? [normalized as AppRole]
    : [];
}

export async function getCurrentRoles() {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  return getRolesForUser(user);
}

export async function getRolesForUser(user: User): Promise<AppRole[]> {
  const metadataRoles = getRolesFromUser(user);
  const account = await getAccountForUser(user);
  const accountRoles = account ? getRolesFromUserLikeValues([account.role, account.accountType]) : [];
  const profileRoles = await getProfileRolesForUser(user);

  return Array.from(new Set([...metadataRoles, ...accountRoles, ...profileRoles]));
}

function getRolesFromUserLikeValues(values: string[]) {
  return values.flatMap((value) => {
    const normalized = normalizeRole(value);

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

export async function getCurrentPermissions(): Promise<RolePermission[]> {
  const roles = await getCurrentRoles();
  if (!roles.length || isDemoMode() || !isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const db = supabase as unknown as ReadOnlySupabaseClient;
  const { data, error } = await db
    .from<RolePermissionRow>("role_permissions")
    .select("role, permission_module, permission_action, allowed")
    .in("role", roles)
    .eq("allowed", true)
    .limit(500);

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data.map((permission) => ({
    role: permission.role,
    module: permission.permission_module as PermissionModule,
    action: permission.permission_action as PermissionAction,
    allowed: permission.allowed
  }));
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

  const roles = await getRolesForUser(user);
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

  const permissions = await getCurrentPermissions();
  return permissions.some(
    (permission) =>
      permission.allowed &&
      permission.module === moduleName &&
      permission.action === action
  );
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
