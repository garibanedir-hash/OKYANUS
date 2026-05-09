import type { NextRequest } from "next/server";

export const maintenanceBypassCookieName = "okyanus_maintenance_bypass";

export function isMaintenanceMode() {
  return process.env.SITE_MAINTENANCE_MODE === "true";
}

export function getMaintenanceBypassToken() {
  return process.env.MAINTENANCE_BYPASS_TOKEN;
}

export function isBypassAllowed(request: NextRequest) {
  const token = getMaintenanceBypassToken();

  if (!token) {
    return false;
  }

  const queryToken = request.nextUrl.searchParams.get("bypass");
  const cookieToken = request.cookies.get(maintenanceBypassCookieName)?.value;

  return queryToken === token || cookieToken === token;
}
