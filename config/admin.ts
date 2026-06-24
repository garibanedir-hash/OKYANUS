export const adminLoginPath = "/admin/giris";
export const adminHomePath = "/admin";
export const publicLoginPath = "/giris";
export const publicRegisterPath = "/kayit";
export const portalHomePath = "/panel";
export const coordinatorHomePath = "/koordinator";
export const personnelHomePath = "/personel";
export const isProductionRuntime = process.env.NODE_ENV === "production";
const allowLocalAdminDemo = process.env.ALLOW_LOCAL_ADMIN_DEMO === "true";

export const isAdminDemoModeRequested =
  process.env.NEXT_PUBLIC_ADMIN_DEMO_MODE === undefined
    ? false
    : process.env.NEXT_PUBLIC_ADMIN_DEMO_MODE !== "false";

export const isAdminDemoMode = !isProductionRuntime && allowLocalAdminDemo && isAdminDemoModeRequested;

export const adminAuthEnabled = !isAdminDemoMode;

export const adminDemoNotice =
  "Yönetim paneli yalnızca yetkili kullanıcılar için açılır.";

export const authModeNotice = isAdminDemoMode
  ? "Yerel önizleme modu aktif."
  : isProductionRuntime
    ? "Korumalı paneller yetkili oturum gerektirir."
    : "Korumalı paneller yetkili oturumla açılır.";
