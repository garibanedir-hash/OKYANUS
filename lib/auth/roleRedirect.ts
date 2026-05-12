import type { AccountType, AppRole } from "@/types/domain";

export function normalizeRole(roleOrAccountType?: string | null): AppRole | AccountType | null {
  if (!roleOrAccountType) {
    return null;
  }

  const normalized = roleOrAccountType.trim().toLowerCase();

  switch (normalized) {
    case "super_admin":
    case "super admin":
      return "super_admin";
    case "admin":
      return "admin";
    case "content_editor":
    case "content editor":
    case "içerik editörü":
    case "icerik editoru":
      return "content_editor";
    case "donation_manager":
    case "donation manager":
    case "bağış sorumlusu":
    case "bagis sorumlusu":
      return "donation_manager";
    case "volunteer_coordinator":
    case "volunteer coordinator":
    case "gönüllü koordinatörü":
    case "gonullu koordinatoru":
      return "volunteer_coordinator";
    case "reporting_manager":
    case "reporting manager":
    case "raporlama sorumlusu":
      return "reporting_manager";
    case "coordinator":
    case "koordinator":
    case "koordinatör":
      return "coordinator";
    case "staff":
    case "personnel":
    case "personel":
      return "staff";
    case "donor":
    case "bagisci":
    case "bağışçı":
      return "donor";
    case "volunteer":
    case "gonullu":
    case "gönüllü":
      return "volunteer";
    case "bağışçı + gönüllü":
    case "bagisci + gonullu":
    case "donor + volunteer":
      return "Bağışçı + Gönüllü";
    default:
      return null;
  }
}

export function getDefaultPanelPathForRole(roleOrAccountType?: AppRole | AccountType | string | null) {
  const role = normalizeRole(roleOrAccountType) ?? roleOrAccountType;

  switch (role) {
    case "super_admin":
    case "admin":
    case "content_editor":
    case "donation_manager":
    case "volunteer_coordinator":
    case "reporting_manager":
      return "/admin";
    case "coordinator":
    case "koordinator":
      return "/koordinator";
    case "staff":
    case "personnel":
    case "personel":
      return "/personel";
    case "Bağışçı":
    case "donor":
    case "bagisci":
      return "/panel/bagisci";
    case "Gönüllü":
    case "volunteer":
    case "gonullu":
      return "/panel/gonullu";
    case "Bağışçı + Gönüllü":
      return "/panel";
    default:
      return "/giris";
  }
}
