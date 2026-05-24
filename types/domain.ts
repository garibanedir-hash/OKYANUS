export type AppRole =
  | "super_admin"
  | "admin"
  | "content_editor"
  | "donation_manager"
  | "volunteer_coordinator"
  | "reporting_manager"
  | "coordinator"
  | "koordinator"
  | "staff"
  | "personnel"
  | "personel"
  | "donor"
  | "bagisci"
  | "volunteer"
  | "gonullu";

export type ProjectStatus = "planning" | "active" | "completed" | "paused" | "archived";
export type DonationStatus = "pending" | "completed" | "failed" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded";
export type ReceiptStatus = "not_required" | "pending" | "prepared" | "issued" | "cancelled" | "failed";
export type VolunteerApplicationStatus = "new" | "reviewing" | "interview" | "assigned" | "completed" | "rejected";
export type MessageStatus = "new" | "read" | "replied" | "archived";
export type ReportStatus = "draft" | "published" | "archived";

export type AdminProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: AppRole;
  status: "active" | "suspended" | "invited";
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  status: ProjectStatus;
  location?: string;
  goalAmount: number;
  raisedAmount: number;
  startDate?: string;
  endDate?: string;
  transparencyNote?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Donation = {
  id: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  donationType: string;
  projectId?: string;
  status: DonationStatus;
  paymentStatus: PaymentStatus;
  receiptStatus: ReceiptStatus;
  note?: string;
  createdAt: string;
};

export type VolunteerApplication = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  age?: number;
  interestArea: string;
  experience?: string;
  status: VolunteerApplicationStatus;
  note?: string;
  submittedAt: string;
};

export type ContactMessage = {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  submittedAt: string;
};

export type NewsPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  relatedProjectId?: string;
  relatedActivityId?: string;
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Report = {
  id: string;
  slug: string;
  title: string;
  period: string;
  category: string;
  summary: string;
  status: ReportStatus;
  pdfAssetId?: string;
  metrics: Array<{ label: string; value: string }>;
  publishedAt?: string;
};

export type AuditLog = {
  id: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

export type AuthUser = {
  id: string;
  email?: string;
  phone?: string;
  createdAt?: string;
};

export type AdminSession = {
  user: AuthUser;
  profile?: AdminProfile;
  expiresAt?: string;
};

export type AdminPermission = AppRole;

export type SupabaseProfile = AdminProfile;

export type AdminGuardResult =
  | { allowed: true; mode: "demo"; reason: string }
  | { allowed: true; mode: "authenticated"; profile: SupabaseProfile }
  | { allowed: false; mode: "missing_env" | "auth_required" | "forbidden"; reason: string };

export type AdminAuthState = {
  demoMode: boolean;
  authEnabled: boolean;
  supabaseConfigured: boolean;
  session?: AdminSession;
};

export type AdminGuardMode = "demo" | "authenticated" | "missing_env" | "auth_required" | "forbidden";

export type RouteGuardResult =
  | { allowed: true; mode: "demo"; reason: string }
  | { allowed: true; mode: "authenticated"; user: AuthUser; roles: AppRole[]; redirectTo: string }
  | { allowed: false; mode: "missing_env" | "auth_required" | "forbidden"; reason: string; loginPath: string };

export type PanelScope = "admin" | "portal" | "coordinator" | "personnel";

export type AuthAccount = {
  id: string;
  authUserId: string;
  fullName: string;
  email: string;
  accountType: string;
  role: string;
  status: string;
};

export type AccountType = "Bağışçı" | "Gönüllü" | "Bağışçı + Gönüllü" | "Koordinatör" | "Personel" | "Admin";

export type PortalUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  accountType: AccountType;
  profileCompletion: number;
};

export type DonorProfile = {
  userId: string;
  totalDonationCount: number;
  totalDonationAmount: number;
  supportedProjectCount: number;
  activeSponsorshipCount: number;
};

export type VolunteerProfile = {
  userId: string;
  status: string;
  applicationStatus: string;
  interestAreas: string[];
};

export type SponsoredOrphan = {
  id: string;
  sponsorshipCode: string;
  maskedName: string;
  ageRange: string;
  region: string;
  educationStatus?: string;
  privacyLevel: "restricted" | "internal_only";
};

export type Sponsorship = {
  id: string;
  sponsorUserId: string;
  sponsoredChildId: string;
  supportStatus: string;
  startDate?: string;
  lastUpdateAt?: string;
};

export type PortalNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  summary: string;
  readAt?: string;
  createdAt: string;
};

export type VolunteerEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity?: number;
  coordinatorId?: string;
  status: string;
};

export type StaffProfile = {
  id: string;
  userId: string;
  role: string;
  responsibilityArea: string;
  coordinatorId?: string;
};

export type CoordinatorProfile = {
  id: string;
  userId: string;
  area: string;
  teamUserIds: string[];
};

export type PermissionModule =
  | "projects"
  | "donations"
  | "receipts"
  | "volunteers"
  | "events"
  | "sponsorships"
  | "tasks"
  | "messages"
  | "staff"
  | "users"
  | "reports"
  | "export"
  | "settings"
  | "legal"
  | "audit_logs";

export type PermissionAction = "view" | "create" | "edit" | "delete" | "publish" | "export" | "assign" | "approve";

export type RolePermission = {
  role: string;
  module: PermissionModule;
  action: PermissionAction;
  allowed: boolean;
};

export type PanelAccessRule = {
  role: string;
  panelScope: string;
  rule: Record<string, unknown>;
};

export type StaffTask = {
  id: string;
  title: string;
  assignedToUserId: string;
  status: string;
  dueDate?: string;
};

export type StaffMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  recipientIds: string[];
  body: string;
  createdAt: string;
};
