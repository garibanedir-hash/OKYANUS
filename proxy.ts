import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isBypassAllowed, isMaintenanceMode, maintenanceBypassCookieName } from "@/config/maintenance";
import { updateSession } from "@/lib/supabase/proxy";

const maintenancePath = "/tadilat";
const openDuringMaintenancePrefixes = ["/admin", "/api", "/panel", "/koordinator", "/personel"];

function isOpenDuringMaintenance(pathname: string) {
  if (pathname === maintenancePath) {
    return true;
  }

  return openDuringMaintenancePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const queryBypass = request.nextUrl.searchParams.get("bypass");

  if (queryBypass && isBypassAllowed(request)) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("bypass");

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(maintenanceBypassCookieName, queryBypass, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8
    });

    return response;
  }

  if (isMaintenanceMode() && !isOpenDuringMaintenance(pathname) && !isBypassAllowed(request)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = maintenancePath;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)"]
};
