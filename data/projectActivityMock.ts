export type ProjectActivityType =
  | "distribution"
  | "field_visit"
  | "procurement"
  | "logistics"
  | "education"
  | "health_support"
  | "qurban_distribution"
  | "orphan_support"
  | "emergency_aid"
  | "media_record"
  | "reporting"
  | "meeting"
  | "volunteer_work"
  | "other";

export type ProjectActivityStatus = "draft" | "planned" | "in_progress" | "completed" | "cancelled" | "archived";

export type ProjectActivityVisibility = "internal" | "public";

export type ProjectActivity = {
  id: string;
  projectId: string;
  projectTitle?: string;
  projectSlug?: string;
  title: string;
  slug?: string;
  activityType: ProjectActivityType;
  activityTypeLabel: string;
  status: ProjectActivityStatus;
  statusLabel: string;
  visibility: ProjectActivityVisibility;
  visibilityLabel: string;
  activityDate?: string;
  startTime?: string;
  endTime?: string;
  country?: string;
  city?: string;
  district?: string;
  locationName?: string;
  regionLabel?: string;
  responsiblePerson?: string;
  teamName?: string;
  beneficiaryCount?: number;
  familyCount?: number;
  distributedItemType?: string;
  distributedItemCount?: number;
  estimatedCost?: number;
  currency: string;
  summary?: string;
  description?: string;
  internalNotes?: string;
  publicSummary?: string;
  coverImageUrl?: string;
  galleryUrls: string[];
  videoUrl?: string;
  reportUrl?: string;
  publishedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicProjectActivity = {
  id: string;
  projectId: string;
  title: string;
  slug?: string;
  activityType: ProjectActivityType;
  activityTypeLabel: string;
  activityDate?: string;
  country?: string;
  city?: string;
  district?: string;
  locationName?: string;
  regionLabel?: string;
  beneficiaryCount?: number;
  familyCount?: number;
  distributedItemType?: string;
  distributedItemCount?: number;
  publicSummary?: string;
  coverImageUrl?: string;
  galleryUrls: string[];
  videoUrl?: string;
  reportUrl?: string;
  publishedAt?: string;
  completedAt?: string;
};

export type ProjectActivityEvent = {
  id: string;
  projectActivityId: string;
  eventType: string;
  oldStatus?: ProjectActivityStatus;
  newStatus?: ProjectActivityStatus;
  actorId?: string;
  actorRole?: string;
  note?: string;
  createdAt: string;
};

export const projectActivityTypeLabels: Record<ProjectActivityType, string> = {
  distribution: "Dağıtım",
  field_visit: "Saha Ziyareti",
  procurement: "Satın Alma",
  logistics: "Lojistik",
  education: "Eğitim",
  health_support: "Sağlık Desteği",
  qurban_distribution: "Kurban Dağıtımı",
  orphan_support: "Yetim Çalışması",
  emergency_aid: "Acil Yardım",
  media_record: "Medya/Görsel Kayıt",
  reporting: "Raporlama",
  meeting: "Toplantı",
  volunteer_work: "Gönüllü Çalışması",
  other: "Diğer"
};

export const projectActivityStatusLabels: Record<ProjectActivityStatus, string> = {
  draft: "Taslak",
  planned: "Planlandı",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
  archived: "Arşivlendi"
};

export const projectActivityVisibilityLabels: Record<ProjectActivityVisibility, string> = {
  internal: "İç Kayıt",
  public: "Public Görünür"
};

export const mockProjectActivities: ProjectActivity[] = [
  {
    id: "project-activity-fallback-001",
    projectId: "project-food-001",
    projectTitle: "Bir Koli Bir Umut",
    projectSlug: "bir-koli-bir-umut",
    title: "Merkez gıda kolisi dağıtımı",
    slug: "merkez-gida-kolisi-dagitimi",
    activityType: "distribution",
    activityTypeLabel: projectActivityTypeLabels.distribution,
    status: "completed",
    statusLabel: projectActivityStatusLabels.completed,
    visibility: "public",
    visibilityLabel: projectActivityVisibilityLabels.public,
    activityDate: "2026-05-15",
    country: "Türkiye",
    city: "İstanbul",
    district: "Ümraniye",
    regionLabel: "Marmara saha",
    responsiblePerson: "Saha Koordinasyon Ekibi",
    teamName: "Gıda Dağıtım Ekibi",
    beneficiaryCount: 184,
    familyCount: 46,
    distributedItemType: "Gıda kolisi",
    distributedItemCount: 46,
    currency: "TRY",
    summary: "İhtiyaç tespiti tamamlanan ailelere gıda kolileri ulaştırıldı.",
    publicSummary: "Saha ekiplerimiz, ihtiyaç tespiti yapılan 46 aileye temel gıda kolilerini teslim etti.",
    galleryUrls: [],
    completedAt: "2026-05-15T15:00:00.000Z",
    publishedAt: "2026-05-16T09:00:00.000Z",
    createdAt: "2026-05-14T11:00:00.000Z",
    updatedAt: "2026-05-16T09:00:00.000Z"
  },
  {
    id: "project-activity-fallback-002",
    projectId: "project-education-001",
    projectTitle: "Yetim Çocuklara Eğitim Desteği",
    projectSlug: "yetim-cocuklara-egitim-destegi",
    title: "Kırtasiye seti hazırlık toplantısı",
    activityType: "meeting",
    activityTypeLabel: projectActivityTypeLabels.meeting,
    status: "planned",
    statusLabel: projectActivityStatusLabels.planned,
    visibility: "internal",
    visibilityLabel: projectActivityVisibilityLabels.internal,
    activityDate: "2026-06-03",
    country: "Türkiye",
    city: "İstanbul",
    responsiblePerson: "Eğitim Destek Birimi",
    beneficiaryCount: 120,
    distributedItemType: "Kırtasiye seti",
    distributedItemCount: 120,
    currency: "TRY",
    summary: "Yeni dönem kırtasiye setlerinin saha planlaması yapılacak.",
    internalNotes: "Tedarik ve teslim takvimi netleştirilecek.",
    galleryUrls: [],
    createdAt: "2026-05-28T08:30:00.000Z",
    updatedAt: "2026-05-28T08:30:00.000Z"
  }
];

export const mockProjectActivityEvents: ProjectActivityEvent[] = [
  {
    id: "project-activity-event-fallback-001",
    projectActivityId: "project-activity-fallback-001",
    eventType: "project_activity.create",
    newStatus: "draft",
    note: "Faaliyet kaydı oluşturuldu.",
    createdAt: "2026-05-14T11:00:00.000Z"
  },
  {
    id: "project-activity-event-fallback-002",
    projectActivityId: "project-activity-fallback-001",
    eventType: "project_activity.complete",
    oldStatus: "in_progress",
    newStatus: "completed",
    note: "Faaliyet tamamlandı.",
    createdAt: "2026-05-15T15:00:00.000Z"
  }
];
