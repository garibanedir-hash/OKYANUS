import {
  mockPanelAccessRules,
  mockPermissions,
  mockRolePermissionMatrix,
  mockRoles
} from "@/data/panelAccessMock";
import type { MockUserAccount } from "@/data/panelAccessMock";
import type { MockStaffMember, MockTask } from "@/data/adminMock";

export function getUserAccounts() {
  return [] as MockUserAccount[];
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
  return {
    profile: {
      id: "",
      fullName: "Koordinatör",
      area: "Yetkili çalışma alanı",
      teamSize: 0,
      activeTasks: 0,
      pendingReports: 0
    },
    team: [] as MockStaffMember[],
    tasks: [] as MockTask[],
    notes: []
  };
}

export function getPersonnelDashboard() {
  return {
    profile: {
      id: "",
      fullName: "Personel",
      area: "Yetkili çalışma alanı",
      openTasks: 0,
      unreadMessages: 0,
      completedThisMonth: 0
    },
    tasks: [] as MockTask[],
    messages: [],
    accessRules: mockPanelAccessRules
  };
}

export function getPanelAccessRules() {
  return mockPanelAccessRules;
}
