import type {
  MockPortalNotification,
  MockPortalUser,
  MockSponsoredOrphan,
  MockSupportedProject,
  MockUserDonation,
  MockVolunteerEvent
} from "@/data/portalMock";

const emptyPortalUser: MockPortalUser = {
  id: "",
  fullName: "Hesap sahibi",
  email: "",
  phone: "",
  city: "",
  accountType: "Bağışçı + Gönüllü",
  profileCompletion: 0
};

const emptyDonorProfile = {
  totalDonationCount: 0,
  totalDonationAmount: 0,
  supportedProjectCount: 0,
  activeSponsorshipCount: 0,
  preferredDonationTypes: [] as string[]
};

const emptyVolunteerProfile = {
  status: "Kayıt bulunmuyor",
  applicationStatus: "Başvuru bulunmuyor",
  joinedActivities: 0,
  assignedTasks: 0,
  interestAreas: [] as string[]
};

export function getCurrentPortalUser() {
  return emptyPortalUser;
}

export function getDonorDashboard() {
  return {
    profile: emptyDonorProfile,
    recentDonations: [] as MockUserDonation[],
    supportedProjects: [] as MockSupportedProject[],
    sponsorships: [] as MockSponsoredOrphan[]
  };
}

export function getVolunteerDashboard() {
  return {
    profile: emptyVolunteerProfile,
    events: [] as MockVolunteerEvent[],
    tasks: [] as string[],
    announcements: [] as string[]
  };
}

export function getUserDonations() {
  return [] as MockUserDonation[];
}

export function getSponsoredOrphans() {
  return [] as MockSponsoredOrphan[];
}

export function getVolunteerEvents() {
  return [] as MockVolunteerEvent[];
}

export function getPortalNotifications() {
  return [] as MockPortalNotification[];
}

export function getUserSupportedProjects() {
  return [] as MockSupportedProject[];
}
