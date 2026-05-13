import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { adminLoginPath, isAdminDemoMode } from "@/config/admin";
import { normalizeRole } from "@/lib/auth/roleRedirect";

type ProxyQueryResult<T> = Promise<{ data: T | null; error: { message?: string; code?: string } | null }>;
type ProxyQueryBuilder<T> = {
  select: (columns?: string) => ProxyQueryBuilder<T>;
  eq: (column: string, value: string) => ProxyQueryBuilder<T>;
  maybeSingle: () => ProxyQueryResult<T>;
};
type ProxyReadClient = {
  from: <T>(table: string) => ProxyQueryBuilder<T>;
};
type ProxyProfileRow = { role: string; status: string };
type ProxyAccountRow = { account_type: string; role: string; status: string };

const guardedRouteConfig = [
  {
    scope: "admin",
    prefixes: ["/admin"],
    loginPath: adminLoginPath,
    allowedRoles: ["super_admin", "admin"]
  },
  {
    scope: "portal",
    prefixes: ["/panel"],
    loginPath: "/giris",
    allowedRoles: ["donor", "bagisci", "volunteer", "gonullu"]
  },
  {
    scope: "coordinator",
    prefixes: ["/koordinator"],
    loginPath: "/giris",
    allowedRoles: ["coordinator", "koordinator", "volunteer_coordinator"]
  },
  {
    scope: "personnel",
    prefixes: ["/personel"],
    loginPath: "/giris",
    allowedRoles: ["staff", "personnel", "personel"]
  }
] as const;

function getProxySupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return { url, key, isConfigured: Boolean(url && key) };
}

function getGuardedRoute(pathname: string) {
  if (pathname === adminLoginPath || pathname.startsWith(`${adminLoginPath}/`)) {
    return null;
  }

  return (
    guardedRouteConfig.find((route) =>
      route.prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    ) ?? null
  );
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

function getRolesFromAuthMetadata(user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }) {
  const metadata = {
    ...user.user_metadata,
    ...user.app_metadata
  };

  return [
    ...readStringArray(metadata.roles),
    ...readStringArray(metadata.role),
    ...readStringArray(metadata.account_type),
    ...readStringArray(metadata.accountType)
  ]
    .flatMap((role) => {
      const normalized = normalizeRole(role);

      if (normalized === "Bağışçı + Gönüllü") {
        return ["donor", "volunteer"];
      }

      if (normalized === "Bağışçı") {
        return ["donor"];
      }

      if (normalized === "Gönüllü") {
        return ["volunteer"];
      }

      return normalized ? [normalized] : [];
    });
}

async function getAdminRolesFromDatabase(client: ProxyReadClient, userId: string) {
  const roles: string[] = [];

  const profileResult = await client
    .from<ProxyProfileRow>("profiles")
    .select("role, status")
    .eq("id", userId)
    .maybeSingle();

  if (profileResult.error) {
    return { roles, verified: false };
  }

  if (profileResult.data?.status === "active") {
    const profileRole = normalizeRole(profileResult.data.role);
    if (profileRole === "super_admin" || profileRole === "admin") {
      roles.push(profileRole);
    }
  }

  const accountResult = await client
    .from<ProxyAccountRow>("user_accounts")
    .select("account_type, role, status")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (accountResult.error) {
    return { roles, verified: false };
  }

  if (accountResult.data?.status === "active") {
    const accountType = normalizeRole(accountResult.data.account_type);
    const accountRole = normalizeRole(accountResult.data.role);

    if (accountType === "admin" || accountRole === "admin") {
      roles.push("admin");
    }

    if (accountRole === "super_admin") {
      roles.push("super_admin");
    }
  }

  return { roles: Array.from(new Set(roles)), verified: true };
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next({ request });
  const guardedRoute = getGuardedRoute(pathname);

  if (!guardedRoute) {
    return response;
  }

  const config = getProxySupabaseConfig();

  if (isAdminDemoMode || !config.isConfigured || !config.url || !config.key) {
    return response;
  }

  const supabase = createServerClient<Database>(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = guardedRoute.loginPath;
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const databaseAdminCheck =
    guardedRoute.scope === "admin"
      ? await getAdminRolesFromDatabase(supabase as unknown as ProxyReadClient, user.id)
      : null;
  const roles = databaseAdminCheck ? databaseAdminCheck.roles : getRolesFromAuthMetadata(user);

  if (!roles.some((role) => (guardedRoute.allowedRoles as readonly string[]).includes(role))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = guardedRoute.loginPath;
    redirectUrl.searchParams.set("durum", databaseAdminCheck?.verified === false ? "rol-dogrulanamadi" : "yetkisiz");
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // TODO: 8D'de profiles/user_accounts/role_permissions üzerinden server-side rol ve kapsam kontrolü eklenecek.
  return response;
}
