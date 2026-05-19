import { mockStaffMembers, mockTasks } from "@/data/adminMock";
import {
  mockCoordinatorProfile,
  mockPanelAccessRules,
  mockPermissions,
  mockPersonnelProfile,
  mockRolePermissionMatrix,
  mockRoles,
  mockUserAccounts
} from "@/data/panelAccessMock";

// 8F notu: Kullanıcı, rol, koordinatör ve personel kapsamı hassas olduğu için bu repository
// şimdilik mock-only kalır. Gerçek sorgular 8G/9A öncesi ownership policy testleriyle açılmalıdır.

export function getUserAccounts() {
  // TODO: Supabase Auth users + user_accounts + profiles ilişkilerinden beslenecek.
  return mockUserAccounts;
}

export function getRoles() {
  return mockRoles;
}

export function getPermissions() {
  return mockPermissions;
}

export function getRolePermissionMatrix() {
  return mockRolePermissionMatrix;
}

export function getCoordinatorDashboard() {
  // TODO: coordinator_assignments ve staff_assignments tablolarından beslenecek.
  return {
    profile: mockCoordinatorProfile,
    team: mockStaffMembers.filter((member) => ["Mehmet Kaya", "Elif Şahin", "Zeynep Arslan"].includes(member.fullName)),
    tasks: mockTasks.filter((task) => ["Gönüllü Başvurusu", "Faaliyet Raporu", "Proje"].includes(task.relatedEntityType)),
    notes: ["Saha faaliyetleri kontenjan kontrolü bekliyor.", "Gönüllü ön görüşme listesi güncellendi."]
  };
}

export function getPersonnelDashboard() {
  // TODO: Kullanıcı session id üzerinden sadece kendi görevleri ve mesajları dönecek.
  return {
    profile: mockPersonnelProfile,
    tasks: mockTasks.filter((task) => task.assignedTo === "Ayşe Demir" || task.assignedTo === "Zeynep Arslan"),
    messages: ["Makbuz kontrol listesi güncellendi.", "Rapor PDF hazırlığı için yeni not eklendi."],
    accessRules: mockPanelAccessRules
  };
}

export function getPanelAccessRules() {
  return mockPanelAccessRules;
}
