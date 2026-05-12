import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { adminLoginPath, isAdminDemoMode } from "@/config/admin";
import { normalizeRole } from "@/lib/auth/roleRedirect";

const guardedRouteConfig = [
  {
    scope: "admin",
    prefixes: ["/admin"],
    loginPath: adminLoginPath,
    allowedRoles: ["super_admin", "admin", "content_editor", "donation_manager", "volunteer_coordinator", "reporting_manager"]
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

  const roles = getRolesFromAuthMetadata(user);

  if (!roles.some((role) => (guardedRoute.allowedRoles as readonly string[]).includes(role))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = guardedRoute.loginPath;
    redirectUrl.searchParams.set("durum", "yetkisiz");
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // TODO: 8D'de profiles/user_accounts/role_permissions üzerinden server-side rol ve kapsam kontrolü eklenecek.
  return response;
}
