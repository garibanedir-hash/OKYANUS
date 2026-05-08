import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { adminHomePath, adminLoginPath, isAdminDemoMode } from "@/config/admin";

function getProxySupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return { url, key, isConfigured: Boolean(url && key) };
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next({ request });

  if (!pathname.startsWith(adminHomePath) || pathname.startsWith(adminLoginPath)) {
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
    redirectUrl.pathname = adminLoginPath;
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // TODO: profiles/admin_roles kontrolü burada veya server layout guard katmanında yapılmalı.
  return response;
}
