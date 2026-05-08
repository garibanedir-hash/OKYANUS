export const adminLoginPath = "/admin/giris";
export const adminHomePath = "/admin";

export const isAdminDemoMode =
  process.env.NEXT_PUBLIC_ADMIN_DEMO_MODE === undefined
    ? true
    : process.env.NEXT_PUBLIC_ADMIN_DEMO_MODE !== "false";

export const adminAuthEnabled = !isAdminDemoMode;

export const adminDemoNotice =
  "Bu panel şu an demo/frontend modunda çalışır. Gerçek kullanım için Supabase Auth, RLS ve rol kontrolleri etkinleştirilmelidir.";
