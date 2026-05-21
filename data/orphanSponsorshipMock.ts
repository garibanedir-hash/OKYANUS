export type OrphanProfileStatus = "draft" | "active" | "sponsored" | "waiting" | "inactive" | "archived";
export type SponsorshipProgramStatus = "draft" | "active" | "paused" | "completed" | "archived";
export type SponsorshipStatus = "pending" | "active" | "payment_pending" | "payment_failed" | "paused" | "completed" | "cancelled" | "archived";
export type SponsorshipPaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";
export type OrphanUpdateStatus = "draft" | "published" | "hidden" | "archived";
export type OrphanAssignmentStatus = "assigned" | "in_progress" | "reported" | "closed" | "cancelled";

export type SponsorshipProgram = {
  id: string;
  slug: string;
  title: string;
  monthlyAmount: number;
  currency: string;
  country: string;
  region: string;
  description: string;
  shortDescription: string;
  status: SponsorshipProgramStatus;
  statusLabel: string;
  startDate: string;
  endDate?: string;
  transparencyNote: string;
  updatedAt: string;
};

export type OrphanProfile = {
  id: string;
  code: string;
  displayName: string;
  safeName: string;
  gender: string;
  birthYear?: number;
  ageGroup: string;
  country: string;
  cityOrRegion: string;
  educationStatus: string;
  generalHealthNote: string;
  familyStatusSummary: string;
  sponsorshipNeedAmount: number;
  currency: string;
  status: OrphanProfileStatus;
  statusLabel: string;
  visibilityLevel: string;
  photoUrl?: string;
  internalNotes: string;
  updatedAt: string;
};

export type Sponsorship = {
  id: string;
  sponsorshipNo: string;
  sponsorAccountId: string;
  sponsorDisplayName: string;
  sponsorEmailMasked: string;
  sponsorPhoneMasked: string;
  orphanId: string;
  orphanCode: string;
  orphanSafeName: string;
  programId: string;
  programTitle: string;
  monthlyAmount: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: SponsorshipStatus;
  statusLabel: string;
  paymentStatus: SponsorshipPaymentStatus;
  paymentStatusLabel: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  receiptStatus: string;
  note: string;
  updatedAt: string;
};

export type SponsorshipPayment = {
  id: string;
  sponsorshipId: string;
  sponsorshipNo: string;
  amount: number;
  currency: string;
  status: SponsorshipPaymentStatus;
  statusLabel: string;
  paymentDate?: string;
  provider?: string;
  providerReference?: string;
  receiptStatus: string;
  createdAt: string;
};

export type OrphanUpdate = {
  id: string;
  orphanId: string;
  orphanCode: string;
  sponsorshipId?: string;
  title: string;
  summary: string;
  content: string;
  updateType: string;
  status: OrphanUpdateStatus;
  statusLabel: string;
  publishedAt?: string;
  createdBy: string;
  updatedAt: string;
};

export type OrphanAssignment = {
  id: string;
  orphanId: string;
  orphanCode: string;
  sponsorshipId?: string;
  sponsorshipNo?: string;
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  assignmentType: string;
  status: OrphanAssignmentStatus;
  statusLabel: string;
  dueDate?: string;
  completedAt?: string;
  notes: string;
  updatedAt: string;
};

export type SponsorshipNotification = {
  id: string;
  sponsorshipId: string;
  sponsorshipNo: string;
  sponsorDisplayName: string;
  sponsorEmailMasked: string;
  sponsorPhoneMasked: string;
  channel: "email" | "sms" | "whatsapp";
  channelLabel: string;
  templateKey: string;
  status: "pending" | "prepared" | "sent" | "failed";
  statusLabel: string;
  sentAt?: string;
  errorMessage?: string;
};

export type DonorSponsoredOrphan = {
  orphanId: string;
  code: string;
  safeName: string;
  ageGroup: string;
  country: string;
  cityOrRegion: string;
  educationStatus: string;
  generalHealthNote: string;
  sponsorshipStatus: SponsorshipStatus;
  sponsorshipStatusLabel: string;
  sponsorAccountId: string;
  sponsorshipId: string;
  lastUpdate?: string;
};

export type SponsorshipStats = {
  totalOrphans: number;
  waitingForSponsor: number;
  activeSponsorships: number;
  paymentPending: number;
  updatesPending: number;
  assignmentsPending: number;
  countryBreakdown: Array<{ label: string; value: number }>;
  statusBreakdown: Array<{ label: string; value: number }>;
};

export const orphanProfileStatusLabels: Record<OrphanProfileStatus, string> = {
  draft: "Taslak",
  active: "Aktif",
  sponsored: "Sponsorlu",
  waiting: "Sponsor bekliyor",
  inactive: "Pasif",
  archived: "Arşivlendi"
};

export const sponsorshipProgramStatusLabels: Record<SponsorshipProgramStatus, string> = {
  draft: "Taslak",
  active: "Aktif",
  paused: "Duraklatıldı",
  completed: "Tamamlandı",
  archived: "Arşivlendi"
};

export const sponsorshipStatusLabels: Record<SponsorshipStatus, string> = {
  pending: "Başvuru bekliyor",
  active: "Aktif",
  payment_pending: "Ödeme bekliyor",
  payment_failed: "Ödeme başarısız",
  paused: "Duraklatıldı",
  completed: "Tamamlandı",
  cancelled: "İptal edildi",
  archived: "Arşivlendi"
};

export const sponsorshipPaymentStatusLabels: Record<SponsorshipPaymentStatus, string> = {
  pending: "Ödeme bekliyor",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade edildi",
  cancelled: "İptal edildi"
};

export const orphanUpdateStatusLabels: Record<OrphanUpdateStatus, string> = {
  draft: "Taslak",
  published: "Yayında",
  hidden: "Gizli",
  archived: "Arşivlendi"
};

export const orphanAssignmentStatusLabels: Record<OrphanAssignmentStatus, string> = {
  assigned: "Atandı",
  in_progress: "Devam ediyor",
  reported: "Raporlandı",
  closed: "Kapandı",
  cancelled: "İptal edildi"
};

export const mockSponsorshipPrograms: SponsorshipProgram[] = [
  {
    id: "sp-regular-education",
    slug: "duzenli-yetim-egitim-destegi",
    title: "Düzenli Yetim Eğitim Desteği",
    monthlyAmount: 1250,
    currency: "TRY",
    country: "Türkiye",
    region: "Bölgesel takip",
    description: "Yetim hamiliği kapsamında eğitim, temel ihtiyaç ve güvenli periyodik takip desteği sunulur.",
    shortDescription: "Eğitim ve temel ihtiyaç odağında aylık yetim hamiliği programı.",
    status: "active",
    statusLabel: sponsorshipProgramStatusLabels.active,
    startDate: "2026-05-01",
    transparencyNote: "Sponsor panelinde yalnızca güvenli özet ve periyodik durum bilgisi paylaşılır.",
    updatedAt: "2026-05-20"
  },
  {
    id: "sp-regional-care",
    slug: "bolgesel-yetim-hamiligi",
    title: "Bölgesel Yetim Hamiliği",
    monthlyAmount: 1500,
    currency: "TRY",
    country: "Yurt dışı",
    region: "Saha koordinasyon bölgeleri",
    description: "Saha ekiplerinin güvenli takip ettiği yetim destek programı.",
    shortDescription: "Bölgesel ihtiyaçlara göre sürdürülebilir yetim hamiliği desteği.",
    status: "active",
    statusLabel: sponsorshipProgramStatusLabels.active,
    startDate: "2026-05-01",
    transparencyNote: "Açık kimlik, adres, okul adı ve hassas aile bilgileri paylaşılmaz.",
    updatedAt: "2026-05-19"
  },
  {
    id: "sp-winter-prep",
    slug: "yetim-kis-destegi",
    title: "Yetim Kış Desteği",
    monthlyAmount: 900,
    currency: "TRY",
    country: "Türkiye",
    region: "Hazırlık bölgeleri",
    description: "Kış dönemi temel ihtiyaç destekleri için hazırlık programı.",
    shortDescription: "Kış dönemi destek planlaması için taslak program.",
    status: "paused",
    statusLabel: sponsorshipProgramStatusLabels.paused,
    startDate: "2026-10-01",
    transparencyNote: "Program aktif edilmeden başvuru ve ödeme süreci açılmaz.",
    updatedAt: "2026-05-16"
  }
];

export const mockOrphanProfiles: OrphanProfile[] = [
  {
    id: "orphan-001",
    code: "YTM-2026-001",
    displayName: "A. Y.",
    safeName: "Güvenli profil adı A",
    gender: "Kız",
    birthYear: 2016,
    ageGroup: "9-12",
    country: "Türkiye",
    cityOrRegion: "Marmara Bölgesi",
    educationStatus: "İlköğretim düzeyi",
    generalHealthNote: "Genel takipte, hassas sağlık detayı paylaşılmaz.",
    familyStatusSummary: "Sınırlı sosyal destek özeti",
    sponsorshipNeedAmount: 1250,
    currency: "TRY",
    status: "sponsored",
    statusLabel: orphanProfileStatusLabels.sponsored,
    visibilityLevel: "limited",
    internalNotes: "Açık adres, okul adı ve aile detayı panelde gösterilmez.",
    updatedAt: "2026-05-20"
  },
  {
    id: "orphan-002",
    code: "YTM-2026-002",
    displayName: "M. K.",
    safeName: "Güvenli profil adı M",
    gender: "Erkek",
    birthYear: 2014,
    ageGroup: "12-15",
    country: "Yurt dışı",
    cityOrRegion: "Saha Bölgesi 2",
    educationStatus: "Ortaöğretim hazırlık",
    generalHealthNote: "Genel durum düzenli takipte.",
    familyStatusSummary: "Kurumsal destek özeti",
    sponsorshipNeedAmount: 1500,
    currency: "TRY",
    status: "waiting",
    statusLabel: orphanProfileStatusLabels.waiting,
    visibilityLevel: "limited",
    internalNotes: "Sponsor bekliyor, mahremiyet seviyesi sınırlı.",
    updatedAt: "2026-05-18"
  },
  {
    id: "orphan-003",
    code: "YTM-2026-003",
    displayName: "S. D.",
    safeName: "Güvenli profil adı S",
    gender: "Kız",
    birthYear: 2018,
    ageGroup: "6-9",
    country: "Türkiye",
    cityOrRegion: "İç Anadolu",
    educationStatus: "İlköğretim başlangıç",
    generalHealthNote: "Genel sağlık bilgisi sınırlı paylaşılır.",
    familyStatusSummary: "İhtiyaç değerlendirmesi tamamlandı.",
    sponsorshipNeedAmount: 1250,
    currency: "TRY",
    status: "active",
    statusLabel: orphanProfileStatusLabels.active,
    visibilityLevel: "limited",
    internalNotes: "Eşleşme hazırlığı sürüyor.",
    updatedAt: "2026-05-17"
  }
];

export const mockSponsorships: Sponsorship[] = [
  {
    id: "sponsorship-001",
    sponsorshipNo: "YSP-2026-0001",
    sponsorAccountId: "demo-donor-account",
    sponsorDisplayName: "A*** K.",
    sponsorEmailMasked: "a***@example.org",
    sponsorPhoneMasked: "+90 5** *** 20 01",
    orphanId: "orphan-001",
    orphanCode: "YTM-2026-001",
    orphanSafeName: "Güvenli profil adı A",
    programId: "sp-regular-education",
    programTitle: "Düzenli Yetim Eğitim Desteği",
    monthlyAmount: 1250,
    currency: "TRY",
    startDate: "2026-05-10",
    status: "active",
    statusLabel: sponsorshipStatusLabels.active,
    paymentStatus: "paid",
    paymentStatusLabel: sponsorshipPaymentStatusLabels.paid,
    lastPaymentDate: "2026-05-10",
    nextPaymentDate: "2026-06-10",
    receiptStatus: "Makbuz sonraki aşama",
    note: "Düzenli destek altyapısı ödeme entegrasyonu sonrası açılacak.",
    updatedAt: "2026-05-20"
  },
  {
    id: "sponsorship-002",
    sponsorshipNo: "YSP-2026-0002",
    sponsorAccountId: "demo-donor-account-2",
    sponsorDisplayName: "M*** T.",
    sponsorEmailMasked: "m***@example.org",
    sponsorPhoneMasked: "+90 5** *** 20 02",
    orphanId: "orphan-002",
    orphanCode: "YTM-2026-002",
    orphanSafeName: "Güvenli profil adı M",
    programId: "sp-regional-care",
    programTitle: "Bölgesel Yetim Hamiliği",
    monthlyAmount: 1500,
    currency: "TRY",
    startDate: "2026-05-18",
    status: "payment_pending",
    statusLabel: sponsorshipStatusLabels.payment_pending,
    paymentStatus: "pending",
    paymentStatusLabel: sponsorshipPaymentStatusLabels.pending,
    nextPaymentDate: "2026-06-18",
    receiptStatus: "Ödeme sonrası hazırlanacak",
    note: "Ödeme entegrasyonu bekliyor.",
    updatedAt: "2026-05-18"
  }
];

export const mockSponsorshipPayments: SponsorshipPayment[] = [
  {
    id: "payment-001",
    sponsorshipId: "sponsorship-001",
    sponsorshipNo: "YSP-2026-0001",
    amount: 1250,
    currency: "TRY",
    status: "paid",
    statusLabel: sponsorshipPaymentStatusLabels.paid,
    paymentDate: "2026-05-10",
    provider: "demo",
    providerReference: "masked-demo-ref",
    receiptStatus: "Makbuz sonraki aşama",
    createdAt: "2026-05-10"
  },
  {
    id: "payment-002",
    sponsorshipId: "sponsorship-002",
    sponsorshipNo: "YSP-2026-0002",
    amount: 1500,
    currency: "TRY",
    status: "pending",
    statusLabel: sponsorshipPaymentStatusLabels.pending,
    receiptStatus: "Ödeme bekleniyor",
    createdAt: "2026-05-18"
  }
];

export const mockOrphanUpdates: OrphanUpdate[] = [
  {
    id: "update-001",
    orphanId: "orphan-001",
    orphanCode: "YTM-2026-001",
    sponsorshipId: "sponsorship-001",
    title: "Mayıs güvenli gelişim özeti",
    summary: "Eğitim devamlılığı ve temel ihtiyaç desteği düzenli takip edildi.",
    content: "Bu güncelleme açık adres, okul adı, kimlik, telefon ve hassas aile detayı içermez.",
    updateType: "Periyodik özet",
    status: "published",
    statusLabel: orphanUpdateStatusLabels.published,
    publishedAt: "2026-05-20",
    createdBy: "Koordinatör Demo",
    updatedAt: "2026-05-20"
  },
  {
    id: "update-002",
    orphanId: "orphan-002",
    orphanCode: "YTM-2026-002",
    sponsorshipId: "sponsorship-002",
    title: "Saha takip notu taslağı",
    summary: "Sponsor paneline açılmadan önce mahremiyet kontrolü gerektirir.",
    content: "Taslak içerik mahremiyet kontrolünden geçmeden yayınlanmamalıdır.",
    updateType: "Saha özeti",
    status: "draft",
    statusLabel: orphanUpdateStatusLabels.draft,
    createdBy: "Personel Demo",
    updatedAt: "2026-05-19"
  }
];

export const mockOrphanAssignments: OrphanAssignment[] = [
  {
    id: "assignment-001",
    orphanId: "orphan-001",
    orphanCode: "YTM-2026-001",
    sponsorshipId: "sponsorship-001",
    sponsorshipNo: "YSP-2026-0001",
    assignedTo: "demo-coordinator-account",
    assignedToName: "Koordinatör Demo",
    assignedBy: "Admin Demo",
    assignmentType: "Periyodik güncelleme kontrolü",
    status: "in_progress",
    statusLabel: orphanAssignmentStatusLabels.in_progress,
    dueDate: "2026-05-28",
    notes: "Güvenli özet dili ve fotoğraf izni kontrol edilecek.",
    updatedAt: "2026-05-20"
  },
  {
    id: "assignment-002",
    orphanId: "orphan-002",
    orphanCode: "YTM-2026-002",
    sponsorshipId: "sponsorship-002",
    sponsorshipNo: "YSP-2026-0002",
    assignedTo: "demo-staff-account",
    assignedToName: "Personel Demo",
    assignedBy: "Koordinatör Demo",
    assignmentType: "Saha güncellemesi hazırlığı",
    status: "assigned",
    statusLabel: orphanAssignmentStatusLabels.assigned,
    dueDate: "2026-05-30",
    notes: "Açık okul adı ve adres bilgisi yazılmamalı.",
    updatedAt: "2026-05-19"
  }
];

export const mockSponsorshipNotifications: SponsorshipNotification[] = [
  {
    id: "snotif-001",
    sponsorshipId: "sponsorship-001",
    sponsorshipNo: "YSP-2026-0001",
    sponsorDisplayName: "A*** K.",
    sponsorEmailMasked: "a***@example.org",
    sponsorPhoneMasked: "+90 5** *** 20 01",
    channel: "email",
    channelLabel: "E-posta",
    templateKey: "orphan_update_ready",
    status: "prepared",
    statusLabel: "Hazır"
  },
  {
    id: "snotif-002",
    sponsorshipId: "sponsorship-002",
    sponsorshipNo: "YSP-2026-0002",
    sponsorDisplayName: "M*** T.",
    sponsorEmailMasked: "m***@example.org",
    sponsorPhoneMasked: "+90 5** *** 20 02",
    channel: "sms",
    channelLabel: "SMS",
    templateKey: "payment_pending",
    status: "pending",
    statusLabel: "Bekliyor"
  }
];

export const mockDonorSponsoredOrphans: DonorSponsoredOrphan[] = mockSponsorships.map((sponsorship) => {
  const orphan = mockOrphanProfiles.find((item) => item.id === sponsorship.orphanId);
  const lastUpdate = mockOrphanUpdates.find((item) => item.sponsorshipId === sponsorship.id && item.status === "published");

  return {
    orphanId: sponsorship.orphanId,
    code: sponsorship.orphanCode,
    safeName: sponsorship.orphanSafeName,
    ageGroup: orphan?.ageGroup ?? "Güvenli yaş grubu",
    country: orphan?.country ?? "Bölge bilgisi sınırlı",
    cityOrRegion: orphan?.cityOrRegion ?? "Bölge bilgisi sınırlı",
    educationStatus: orphan?.educationStatus ?? "Eğitim bilgisi sınırlı",
    generalHealthNote: orphan?.generalHealthNote ?? "Hassas sağlık detayı paylaşılmaz.",
    sponsorshipStatus: sponsorship.status,
    sponsorshipStatusLabel: sponsorship.statusLabel,
    sponsorAccountId: sponsorship.sponsorAccountId,
    sponsorshipId: sponsorship.id,
    lastUpdate: lastUpdate?.publishedAt
  };
});

export const mockSponsorshipStats: SponsorshipStats = {
  totalOrphans: mockOrphanProfiles.length,
  waitingForSponsor: mockOrphanProfiles.filter((profile) => ["active", "waiting"].includes(profile.status)).length,
  activeSponsorships: mockSponsorships.filter((item) => item.status === "active").length,
  paymentPending: mockSponsorships.filter((item) => item.paymentStatus === "pending").length,
  updatesPending: mockOrphanUpdates.filter((item) => item.status === "draft").length,
  assignmentsPending: mockOrphanAssignments.filter((item) => ["assigned", "in_progress"].includes(item.status)).length,
  countryBreakdown: [
    { label: "Türkiye", value: 2 },
    { label: "Yurt dışı", value: 1 }
  ],
  statusBreakdown: [
    { label: "Sponsorlu", value: 1 },
    { label: "Sponsor bekliyor", value: 2 }
  ]
};
