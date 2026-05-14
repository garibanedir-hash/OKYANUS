export const adminLoginPath = "/admin/giris";
export const adminHomePath = "/admin";
export const publicLoginPath = "/giris";
export const publicRegisterPath = "/kayit";
export const portalHomePath = "/panel";
export const coordinatorHomePath = "/koordinator";
export const personnelHomePath = "/personel";
export const isProductionRuntime = process.env.NODE_ENV === "production";

export const isAdminDemoModeRequested =
  process.env.NEXT_PUBLIC_ADMIN_DEMO_MODE === undefined
    ? true
    : process.env.NEXT_PUBLIC_ADMIN_DEMO_MODE !== "false";

export const isAdminDemoMode = !isProductionRuntime && isAdminDemoModeRequested;

export const adminAuthEnabled = !isAdminDemoMode;

export const adminDemoNotice =
  "Bu panel şu an demo/frontend modunda çalışır. Gerçek kullanım için Supabase Auth, RLS ve rol kontrolleri etkinleştirilmelidir.";

export const authModeNotice = isAdminDemoMode
  ? "Demo mod aktif: admin, portal, koordinatör ve personel panelleri önizleme için açıktır."
  : isProductionRuntime
    ? "Production modu: korumalı paneller Supabase session ve server-side rol kontrolü gerektirir."
    : "Auth modu aktif: korumalı paneller Supabase session ve role-based guard ile kontrol edilir.";
