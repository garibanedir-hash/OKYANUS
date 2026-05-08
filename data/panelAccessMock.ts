export type MockRole = {
  id: string;
  title: string;
  scope: string;
};

export type MockPermission = {
  module: string;
  actions: string[];
};

export type MockUserAccount = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  accountType: string;
  role: string;
  status: string;
  lastLogin: string;
  profileCompletion: number;
};

export const mockRoles: MockRole[] = [
  { id: "role-super", title: "Super Admin", scope: "Tüm sistem" },
  { id: "role-admin", title: "Admin", scope: "Yönetim paneli" },
  { id: "role-coordinator", title: "Koordinatör", scope: "Sorumlu ekip ve faaliyetler" },
  { id: "role-staff", title: "Personel", scope: "Kendi görevleri" },
  { id: "role-donor", title: "Bağışçı", scope: "Kendi bağış ve sponsorlukları" },
  { id: "role-volunteer", title: "Gönüllü", scope: "Kendi etkinlik ve görevleri" }
];

export const mockPermissions: MockPermission[] = [
  { module: "Projeler", actions: ["Görüntüleme", "Oluşturma", "Düzenleme", "Yayınlama"] },
  { module: "Bağışlar", actions: ["Görüntüleme", "Düzenleme", "Export"] },
  { module: "Makbuzlar", actions: ["Görüntüleme", "Düzenleme", "Onaylama"] },
  { module: "Gönüllü Başvuruları", actions: ["Görüntüleme", "Düzenleme", "Atama"] },
  { module: "Etkinlikler", actions: ["Görüntüleme", "Oluşturma", "Düzenleme", "Onaylama"] },
  { module: "Yetim Sponsorluk", actions: ["Görüntüleme", "Düzenleme"] },
  { module: "Görevler", actions: ["Görüntüleme", "Oluşturma", "Düzenleme", "Atama"] },
  { module: "Mesajlar", actions: ["Görüntüleme", "Oluşturma"] },
  { module: "Personel", actions: ["Görüntüleme", "Düzenleme"] },
  { module: "Kullanıcılar", actions: ["Görüntüleme", "Düzenleme", "Onaylama"] },
  { module: "Raporlar", actions: ["Görüntüleme", "Oluşturma", "Yayınlama", "Export"] },
  { module: "Site Ayarları", actions: ["Görüntüleme", "Düzenleme"] },
  { module: "Yasal Sayfalar", actions: ["Görüntüleme", "Düzenleme", "Yayınlama"] },
  { module: "Audit Log", actions: ["Görüntüleme"] }
];

export const mockUserAccounts: MockUserAccount[] = [
  { id: "acc-1", fullName: "Demo Destekçi", email: "destekci@example.com", phone: "+90 555 000 10 20", accountType: "Bağışçı + Gönüllü", role: "Bağışçı", status: "Aktif", lastLogin: "Bugün", profileCompletion: 82 },
  { id: "acc-2", fullName: "Ayşe Demir", email: "ayse@okyanus.org", phone: "+90 555 000 20 10", accountType: "Personel", role: "Bağış Sorumlusu", status: "Aktif", lastLogin: "24 dk önce", profileCompletion: 96 },
  { id: "acc-3", fullName: "Mehmet Kaya", email: "mehmet@okyanus.org", phone: "+90 555 000 20 11", accountType: "Koordinatör", role: "Gönüllü Koordinatörü", status: "Aktif", lastLogin: "1 saat önce", profileCompletion: 91 },
  { id: "acc-4", fullName: "Zeynep Arslan", email: "zeynep@okyanus.org", phone: "+90 555 000 20 12", accountType: "Personel", role: "Raporlama Sorumlusu", status: "Aktif", lastLogin: "Dün", profileCompletion: 88 },
  { id: "acc-5", fullName: "Gönüllü Adayı", email: "gonullu@example.com", phone: "+90 555 000 30 10", accountType: "Gönüllü", role: "Gönüllü", status: "Onay bekliyor", lastLogin: "Henüz yok", profileCompletion: 64 }
];

export const mockCoordinatorProfile = {
  id: "coord-1",
  fullName: "Mehmet Kaya",
  area: "Gönüllü koordinasyonu ve saha faaliyetleri",
  teamSize: 7,
  activeTasks: 9,
  pendingReports: 2
};

export const mockPersonnelProfile = {
  id: "staff-panel-1",
  fullName: "Ayşe Demir",
  area: "Bağış ve makbuz kontrolü",
  openTasks: 4,
  unreadMessages: 2,
  completedThisMonth: 11
};

export const mockPanelAccessRules = [
  "Bağışçı sadece kendi bağışlarını ve sponsorluk kayıtlarını görür.",
  "Gönüllü yalnızca kendi başvuru, etkinlik ve görevlerini görür.",
  "Koordinatör sadece sorumlu ekip ve faaliyet alanını yönetir.",
  "Personel sadece kendisine atanan görev ve konuşmalara erişir."
];

export const mockRolePermissionMatrix = mockRoles.map((role) => ({
  role: role.title,
  permissions: mockPermissions.map((permission) => ({
    module: permission.module,
    allowedActions:
      role.title === "Super Admin"
        ? permission.actions
        : permission.actions.filter((action) => ["Görüntüleme", "Düzenleme", "Atama"].includes(action)).slice(0, role.title === "Personel" ? 1 : 3)
  }))
}));
