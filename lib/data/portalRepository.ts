import {
  mockDonorProfile,
  mockPortalNotifications,
  mockPortalUser,
  mockSponsoredOrphans,
  mockUserDonations,
  mockUserSupportedProjects,
  mockVolunteerEvents,
  mockVolunteerProfile
} from "@/data/portalMock";

// 8F notu: Portal verileri hassas kullanıcı kapsamı içerdiği için bu repository şimdilik
// mock-only kalır. CRUD veya Supabase hassas tablo sorgusu bu aşamada yapılmaz.

export function getCurrentPortalUser() {
  // TODO: Supabase Auth session + user_accounts tablosundan beslenecek.
  return mockPortalUser;
}

export function getDonorDashboard() {
  // TODO: donor_profiles, donations ve sponsorships ilişkileriyle üretilecek.
  return {
    profile: mockDonorProfile,
    recentDonations: mockUserDonations.slice(0, 3),
    supportedProjects: mockUserSupportedProjects.filter((project) => project.relation === "Bağışçı"),
    sponsorships: mockSponsoredOrphans
  };
}

export function getVolunteerDashboard() {
  // TODO: volunteer_profiles, volunteer_events ve staff_tasks ilişkileriyle üretilecek.
  return {
    profile: mockVolunteerProfile,
    events: mockVolunteerEvents,
    tasks: ["Gıda kolisi sayımına destek", "Oryantasyon dokümanını tamamla"],
    announcements: ["Yeni saha oryantasyon takvimi yayınlandı.", "Lojistik destek ekipleri güncellendi."]
  };
}

export function getUserDonations() {
  return mockUserDonations;
}

export function getSponsoredOrphans() {
  return mockSponsoredOrphans;
}

export function getVolunteerEvents() {
  return mockVolunteerEvents;
}

export function getPortalNotifications() {
  return mockPortalNotifications;
}

export function getUserSupportedProjects() {
  return mockUserSupportedProjects;
}
