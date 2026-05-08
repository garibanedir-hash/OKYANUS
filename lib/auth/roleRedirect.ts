import type { AccountType, AppRole } from "@/types/domain";

export function getDefaultPanelPathForRole(roleOrAccountType?: AppRole | AccountType | "coordinator" | "staff" | "admin") {
  switch (roleOrAccountType) {
    case "super_admin":
    case "admin":
    case "content_editor":
    case "donation_manager":
    case "volunteer_coordinator":
    case "reporting_manager":
      return "/admin";
    case "coordinator":
      return "/koordinator";
    case "staff":
      return "/personel";
    case "Bağışçı":
      return "/panel/bagisci";
    case "Gönüllü":
      return "/panel/gonullu";
    case "Bağışçı + Gönüllü":
      return "/panel";
    default:
      return "/panel";
  }
}
