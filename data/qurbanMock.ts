export type QurbanType = "vacip" | "adak" | "akika" | "sukur" | "nafile" | "genel";
export type QurbanRegionType = "yurt_ici" | "yurt_disi";
export type QurbanCampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";
export type QurbanOrderStatus =
  | "draft"
  | "delegation_pending"
  | "payment_pending"
  | "payment_confirmed"
  | "scheduled"
  | "slaughtered"
  | "distributed"
  | "completed"
  | "cancelled";
export type QurbanDelegationStatus = "pending" | "accepted" | "revoked" | "archived";
export type QurbanOperationStatus =
  | "planning"
  | "assigned"
  | "in_progress"
  | "slaughter_completed"
  | "distribution_completed"
  | "reported"
  | "closed";
export type QurbanPaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export type QurbanCampaign = {
  id: string;
  slug: string;
  title: string;
  type: QurbanType;
  typeLabel: string;
  regionType: QurbanRegionType;
  regionLabel: string;
  country: string;
  cityOrRegion: string;
  unitPrice: number;
  currency: string;
  quotaTotal: number;
  quotaReserved: number;
  quotaCompleted: number;
  startDate: string;
  endDate: string;
  status: QurbanCampaignStatus;
  statusLabel: string;
  shortDescription: string;
  description: string;
  delegationText: string;
  transparencyNote: string;
  coverImageUrl?: string;
  updatedAt: string;
};

export type QurbanOrder = {
  id: string;
  orderNo: string;
  campaignId: string;
  campaignTitle: string;
  donorAccountId: string;
  donorDisplayName: string;
  donorEmailMasked: string;
  donorPhoneMasked: string;
  donorCity: string;
  qurbanType: QurbanType;
  qurbanTypeLabel: string;
  shareCount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: QurbanPaymentStatus;
  paymentStatusLabel: string;
  orderStatus: QurbanOrderStatus;
  orderStatusLabel: string;
  delegationStatus: QurbanDelegationStatus;
  delegationStatusLabel: string;
  delegationAcceptedAt?: string;
  note: string;
  receiptStatus: string;
  createdAt: string;
  operationId?: string;
};

export type QurbanDelegation = {
  id: string;
  delegationNo: string;
  orderId: string;
  orderNo: string;
  campaignTitle: string;
  donorDisplayName: string;
  donorEmailMasked: string;
  status: QurbanDelegationStatus;
  statusLabel: string;
  acceptedAt?: string;
};

export type QurbanShare = {
  id: string;
  orderId: string;
  campaignId: string;
  shareNo: string;
  donorDisplayName: string;
  status: QurbanOrderStatus;
  statusLabel: string;
  assignedOperationId?: string;
  slaughteredAt?: string;
  distributedAt?: string;
  createdAt: string;
};

export type QurbanOperation = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  operationNo: string;
  country: string;
  cityOrRegion: string;
  slaughterLocation: string;
  distributionArea: string;
  plannedSlaughterDate: string;
  actualSlaughterDate?: string;
  responsibleCoordinatorId: string;
  responsibleCoordinatorName: string;
  responsibleStaffId: string;
  responsibleStaffName: string;
  status: QurbanOperationStatus;
  statusLabel: string;
  totalShares: number;
  completedShares: number;
  notes: string;
  updatedAt: string;
};

export type QurbanDistributionLog = {
  id: string;
  operationId: string;
  operationNo: string;
  campaignId: string;
  campaignTitle: string;
  distributionDate: string;
  location: string;
  beneficiaryGroup: string;
  packageCount: number;
  familyCount: number;
  notes: string;
  statusLabel: string;
};

export type QurbanNotification = {
  id: string;
  orderId: string;
  orderNo: string;
  donorDisplayName: string;
  donorEmailMasked: string;
  donorPhoneMasked: string;
  channel: "email" | "sms" | "whatsapp";
  channelLabel: string;
  templateKey: string;
  status: "pending" | "prepared" | "sent" | "failed";
  statusLabel: string;
  sentAt?: string;
  errorMessage?: string;
};

export type QurbanStats = {
  totalOrders: number;
  totalShares: number;
  delegationPending: number;
  paymentPending: number;
  scheduled: number;
  slaughtered: number;
  distributed: number;
  notificationPending: number;
  regionBreakdown: Array<{ label: string; value: number }>;
  typeBreakdown: Array<{ label: string; value: number }>;
};

export const qurbanTypeLabels: Record<QurbanType, string> = {
  vacip: "Vacip",
  adak: "Adak",
  akika: "Akika",
  sukur: "Şükür",
  nafile: "Nafile",
  genel: "Genel"
};

export const qurbanRegionLabels: Record<QurbanRegionType, string> = {
  yurt_ici: "Yurt içi",
  yurt_disi: "Yurt dışı"
};

export const qurbanCampaignStatusLabels: Record<QurbanCampaignStatus, string> = {
  draft: "Taslak",
  active: "Aktif",
  paused: "Duraklatıldı",
  completed: "Tamamlandı",
  archived: "Arşivlendi"
};

export const qurbanOrderStatusLabels: Record<QurbanOrderStatus, string> = {
  draft: "Taslak",
  delegation_pending: "Vekalet bekliyor",
  payment_pending: "Ödeme bekliyor",
  payment_confirmed: "Ödeme onaylandı",
  scheduled: "Kesim planlandı",
  slaughtered: "Kesim tamamlandı",
  distributed: "Dağıtım yapıldı",
  completed: "Tamamlandı",
  cancelled: "İptal edildi"
};

export const qurbanDelegationStatusLabels: Record<QurbanDelegationStatus, string> = {
  pending: "Bekliyor",
  accepted: "Kabul edildi",
  revoked: "Geri alındı",
  archived: "Arşivlendi"
};

export const qurbanOperationStatusLabels: Record<QurbanOperationStatus, string> = {
  planning: "Planlama",
  assigned: "Atandı",
  in_progress: "Devam ediyor",
  slaughter_completed: "Kesim tamamlandı",
  distribution_completed: "Dağıtım tamamlandı",
  reported: "Raporlandı",
  closed: "Kapandı"
};

export const qurbanPaymentStatusLabels: Record<QurbanPaymentStatus, string> = {
  pending: "Bekliyor",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade edildi",
  cancelled: "İptal edildi"
};

export const mockQurbanCampaigns: QurbanCampaign[] = [
  {
    id: "qcamp-2026-vacip-yurt-disi",
    slug: "2026-yurt-disi-vacip-kurban",
    title: "2026 Yurt Dışı Vacip Kurban Organizasyonu",
    type: "vacip",
    typeLabel: qurbanTypeLabels.vacip,
    regionType: "yurt_disi",
    regionLabel: qurbanRegionLabels.yurt_disi,
    country: "Afrika Bölgesi",
    cityOrRegion: "Saha koordinasyon bölgeleri",
    unitPrice: 6500,
    currency: "TRY",
    quotaTotal: 700,
    quotaReserved: 286,
    quotaCompleted: 148,
    startDate: "2026-05-01",
    endDate: "2026-06-15",
    status: "active",
    statusLabel: qurbanCampaignStatusLabels.active,
    shortDescription: "Vacip kurban bağışları vekalet, kesim ve dağıtım süreciyle kayıt altında takip edilir.",
    description:
      "Yurt dışı vacip kurban organizasyonu, bölge sorumluları ve saha ekipleriyle planlı kesim ve dağıtım takibi yapılacak şekilde tasarlanmıştır.",
    delegationText:
      "Bağışçı, kurban kesimi ve dağıtımı için Okyanus İnsani Yardım Derneği'ni vekil tayin ettiğini beyan eder.",
    transparencyNote:
      "Vekalet, emanet takibi, kesim ve dağıtım durumları ayrı aşamalar olarak izlenir; bağışçı bilgilendirmeleri kayıt altında yürütülür.",
    updatedAt: "2026-05-18"
  },
  {
    id: "qcamp-2026-yurt-ici-adak-akika",
    slug: "2026-yurt-ici-adak-akika",
    title: "Yurt İçi Adak ve Akika Kurbanları",
    type: "adak",
    typeLabel: qurbanTypeLabels.adak,
    regionType: "yurt_ici",
    regionLabel: qurbanRegionLabels.yurt_ici,
    country: "Türkiye",
    cityOrRegion: "Marmara ve İç Anadolu",
    unitPrice: 9200,
    currency: "TRY",
    quotaTotal: 120,
    quotaReserved: 42,
    quotaCompleted: 18,
    startDate: "2026-05-10",
    endDate: "2026-12-31",
    status: "active",
    statusLabel: qurbanCampaignStatusLabels.active,
    shortDescription: "Adak ve akika kurbanları için yurt içi operasyon, vekalet ve dağıtım takibi.",
    description:
      "Adak ve akika kurbanları için bağışçının niyet bilgisi, vekalet onayı ve kesim planı ayrı kayıtlarda izlenebilir.",
    delegationText:
      "Bağışçı, adak veya akika kurbanı için vekalet verdiğini ve kesim-dağıtım sürecinin dernek tarafından yürütülmesini kabul eder.",
    transparencyNote:
      "Kesim ve dağıtım süreci bağışçı bilgilendirmesi, emanet takibi ve iç kontrol adımlarıyla izlenir.",
    updatedAt: "2026-05-16"
  },
  {
    id: "qcamp-2026-sukur-nafile",
    slug: "2026-sukur-nafile-kurban",
    title: "Şükür ve Nafile Kurban Destekleri",
    type: "sukur",
    typeLabel: qurbanTypeLabels.sukur,
    regionType: "yurt_ici",
    regionLabel: qurbanRegionLabels.yurt_ici,
    country: "Türkiye",
    cityOrRegion: "Bölgesel ihtiyaç alanları",
    unitPrice: 8800,
    currency: "TRY",
    quotaTotal: 80,
    quotaReserved: 11,
    quotaCompleted: 6,
    startDate: "2026-05-20",
    endDate: "2026-10-30",
    status: "paused",
    statusLabel: qurbanCampaignStatusLabels.paused,
    shortDescription: "Şükür ve nafile kurban süreçleri için planlama durumundaki kampanya.",
    description:
      "Şükür ve nafile kurban destekleri, dönemsel ihtiyaçlara göre planlanan kesim ve dağıtım çalışmaları kapsamında değerlendirilir.",
    delegationText:
      "Bağışçı, şükür veya nafile kurbanı için vekalet verdiğini ve sürecin dernek tarafından yürütülmesini kabul eder.",
    transparencyNote: "Duraklatılmış kampanyalar public aktif listede gösterilmez; admin ekranda operasyon hazırlığı için izlenir.",
    updatedAt: "2026-05-14"
  }
];

export const mockQurbanOrders: QurbanOrder[] = [
  {
    id: "qorder-001",
    orderNo: "KRB-2026-0001",
    campaignId: "qcamp-2026-vacip-yurt-disi",
    campaignTitle: "2026 Yurt Dışı Vacip Kurban Organizasyonu",
    donorAccountId: "demo-donor-account",
    donorDisplayName: "M*** Y.",
    donorEmailMasked: "m***@example.org",
    donorPhoneMasked: "+90 5** *** 10 01",
    donorCity: "İstanbul",
    qurbanType: "vacip",
    qurbanTypeLabel: qurbanTypeLabels.vacip,
    shareCount: 1,
    totalAmount: 6500,
    currency: "TRY",
    paymentStatus: "paid",
    paymentStatusLabel: qurbanPaymentStatusLabels.paid,
    orderStatus: "scheduled",
    orderStatusLabel: qurbanOrderStatusLabels.scheduled,
    delegationStatus: "accepted",
    delegationStatusLabel: qurbanDelegationStatusLabels.accepted,
    delegationAcceptedAt: "2026-05-12 14:20",
    note: "Bilgilendirme SMS yerine e-posta ile isteniyor.",
    receiptStatus: "Makbuz beklemede",
    createdAt: "2026-05-12",
    operationId: "qop-001"
  },
  {
    id: "qorder-002",
    orderNo: "KRB-2026-0002",
    campaignId: "qcamp-2026-vacip-yurt-disi",
    campaignTitle: "2026 Yurt Dışı Vacip Kurban Organizasyonu",
    donorAccountId: "demo-donor-account",
    donorDisplayName: "A*** K.",
    donorEmailMasked: "a***@example.org",
    donorPhoneMasked: "+90 5** *** 10 02",
    donorCity: "Ankara",
    qurbanType: "vacip",
    qurbanTypeLabel: qurbanTypeLabels.vacip,
    shareCount: 2,
    totalAmount: 13000,
    currency: "TRY",
    paymentStatus: "pending",
    paymentStatusLabel: qurbanPaymentStatusLabels.pending,
    orderStatus: "payment_pending",
    orderStatusLabel: qurbanOrderStatusLabels.payment_pending,
    delegationStatus: "accepted",
    delegationStatusLabel: qurbanDelegationStatusLabels.accepted,
    delegationAcceptedAt: "2026-05-13 09:45",
    note: "İki hisse tek bağışçı hesabı altında takip ediliyor.",
    receiptStatus: "Ödeme sonrası hazırlanacak",
    createdAt: "2026-05-13",
    operationId: "qop-001"
  },
  {
    id: "qorder-003",
    orderNo: "KRB-2026-0003",
    campaignId: "qcamp-2026-yurt-ici-adak-akika",
    campaignTitle: "Yurt İçi Adak ve Akika Kurbanları",
    donorAccountId: "demo-donor-account-2",
    donorDisplayName: "S*** D.",
    donorEmailMasked: "s***@example.org",
    donorPhoneMasked: "+90 5** *** 10 03",
    donorCity: "Konya",
    qurbanType: "akika",
    qurbanTypeLabel: qurbanTypeLabels.akika,
    shareCount: 1,
    totalAmount: 9200,
    currency: "TRY",
    paymentStatus: "paid",
    paymentStatusLabel: qurbanPaymentStatusLabels.paid,
    orderStatus: "slaughtered",
    orderStatusLabel: qurbanOrderStatusLabels.slaughtered,
    delegationStatus: "accepted",
    delegationStatusLabel: qurbanDelegationStatusLabels.accepted,
    delegationAcceptedAt: "2026-05-14 11:05",
    note: "Akika niyeti not alanında tutulur; public ekranda gösterilmez.",
    receiptStatus: "Makbuz demo",
    createdAt: "2026-05-14",
    operationId: "qop-002"
  },
  {
    id: "qorder-004",
    orderNo: "KRB-2026-0004",
    campaignId: "qcamp-2026-yurt-ici-adak-akika",
    campaignTitle: "Yurt İçi Adak ve Akika Kurbanları",
    donorAccountId: "demo-donor-account-3",
    donorDisplayName: "E*** T.",
    donorEmailMasked: "e***@example.org",
    donorPhoneMasked: "+90 5** *** 10 04",
    donorCity: "Bursa",
    qurbanType: "adak",
    qurbanTypeLabel: qurbanTypeLabels.adak,
    shareCount: 1,
    totalAmount: 9200,
    currency: "TRY",
    paymentStatus: "pending",
    paymentStatusLabel: qurbanPaymentStatusLabels.pending,
    orderStatus: "delegation_pending",
    orderStatusLabel: qurbanOrderStatusLabels.delegation_pending,
    delegationStatus: "pending",
    delegationStatusLabel: qurbanDelegationStatusLabels.pending,
    note: "Vekalet onayı bekleniyor.",
    receiptStatus: "Makbuz yok",
    createdAt: "2026-05-15"
  }
];

export const mockQurbanDelegations: QurbanDelegation[] = mockQurbanOrders.map((order, index) => ({
  id: `qdelegation-${index + 1}`,
  delegationNo: `VKLT-2026-${String(index + 1).padStart(4, "0")}`,
  orderId: order.id,
  orderNo: order.orderNo,
  campaignTitle: order.campaignTitle,
  donorDisplayName: order.donorDisplayName,
  donorEmailMasked: order.donorEmailMasked,
  status: order.delegationStatus,
  statusLabel: order.delegationStatusLabel,
  acceptedAt: order.delegationAcceptedAt
}));

export const mockQurbanShares: QurbanShare[] = [
  {
    id: "qshare-001",
    orderId: "qorder-001",
    campaignId: "qcamp-2026-vacip-yurt-disi",
    shareNo: "HSS-2026-001",
    donorDisplayName: "M*** Y.",
    status: "scheduled",
    statusLabel: qurbanOrderStatusLabels.scheduled,
    assignedOperationId: "qop-001",
    createdAt: "2026-05-12"
  },
  {
    id: "qshare-002",
    orderId: "qorder-002",
    campaignId: "qcamp-2026-vacip-yurt-disi",
    shareNo: "HSS-2026-002",
    donorDisplayName: "A*** K.",
    status: "payment_pending",
    statusLabel: qurbanOrderStatusLabels.payment_pending,
    assignedOperationId: "qop-001",
    createdAt: "2026-05-13"
  },
  {
    id: "qshare-003",
    orderId: "qorder-002",
    campaignId: "qcamp-2026-vacip-yurt-disi",
    shareNo: "HSS-2026-003",
    donorDisplayName: "A*** K.",
    status: "payment_pending",
    statusLabel: qurbanOrderStatusLabels.payment_pending,
    assignedOperationId: "qop-001",
    createdAt: "2026-05-13"
  },
  {
    id: "qshare-004",
    orderId: "qorder-003",
    campaignId: "qcamp-2026-yurt-ici-adak-akika",
    shareNo: "HSS-2026-004",
    donorDisplayName: "S*** D.",
    status: "slaughtered",
    statusLabel: qurbanOrderStatusLabels.slaughtered,
    assignedOperationId: "qop-002",
    slaughteredAt: "2026-05-16 10:35",
    createdAt: "2026-05-14"
  }
];

export const mockQurbanOperations: QurbanOperation[] = [
  {
    id: "qop-001",
    campaignId: "qcamp-2026-vacip-yurt-disi",
    campaignTitle: "2026 Yurt Dışı Vacip Kurban Organizasyonu",
    operationNo: "OP-KRB-2026-001",
    country: "Afrika Bölgesi",
    cityOrRegion: "1. Bölge",
    slaughterLocation: "Onaylı kesim noktası A",
    distributionArea: "Kırsal destek hattı",
    plannedSlaughterDate: "2026-06-16",
    responsibleCoordinatorId: "demo-coordinator-account",
    responsibleCoordinatorName: "Koordinatör Demo",
    responsibleStaffId: "demo-staff-account",
    responsibleStaffName: "Personel Demo",
    status: "assigned",
    statusLabel: qurbanOperationStatusLabels.assigned,
    totalShares: 48,
    completedShares: 0,
    notes: "Kesim listesi ödeme onaylarından sonra kilitlenecek.",
    updatedAt: "2026-05-18"
  },
  {
    id: "qop-002",
    campaignId: "qcamp-2026-yurt-ici-adak-akika",
    campaignTitle: "Yurt İçi Adak ve Akika Kurbanları",
    operationNo: "OP-KRB-2026-002",
    country: "Türkiye",
    cityOrRegion: "İç Anadolu",
    slaughterLocation: "Onaylı kesim noktası B",
    distributionArea: "Aile destek programı",
    plannedSlaughterDate: "2026-05-16",
    actualSlaughterDate: "2026-05-16",
    responsibleCoordinatorId: "demo-coordinator-account",
    responsibleCoordinatorName: "Koordinatör Demo",
    responsibleStaffId: "demo-staff-account",
    responsibleStaffName: "Personel Demo",
    status: "slaughter_completed",
    statusLabel: qurbanOperationStatusLabels.slaughter_completed,
    totalShares: 18,
    completedShares: 16,
    notes: "Dağıtım raporu saha ekibinden bekleniyor.",
    updatedAt: "2026-05-17"
  },
  {
    id: "qop-003",
    campaignId: "qcamp-2026-sukur-nafile",
    campaignTitle: "Şükür ve Nafile Kurban Destekleri",
    operationNo: "OP-KRB-2026-003",
    country: "Türkiye",
    cityOrRegion: "Marmara",
    slaughterLocation: "Planlama aşaması",
    distributionArea: "İhtiyaç tespiti bekleniyor",
    plannedSlaughterDate: "2026-06-02",
    responsibleCoordinatorId: "demo-coordinator-account-2",
    responsibleCoordinatorName: "Koordinatör Demo 2",
    responsibleStaffId: "demo-staff-account-2",
    responsibleStaffName: "Personel Demo 2",
    status: "planning",
    statusLabel: qurbanOperationStatusLabels.planning,
    totalShares: 12,
    completedShares: 0,
    notes: "Kampanya duraklatıldığı için operasyon kilitlenmedi.",
    updatedAt: "2026-05-14"
  }
];

export const mockQurbanDistributionLogs: QurbanDistributionLog[] = [
  {
    id: "qdist-001",
    operationId: "qop-002",
    operationNo: "OP-KRB-2026-002",
    campaignId: "qcamp-2026-yurt-ici-adak-akika",
    campaignTitle: "Yurt İçi Adak ve Akika Kurbanları",
    distributionDate: "2026-05-17",
    location: "İç Anadolu destek bölgesi",
    beneficiaryGroup: "İhtiyaç sahibi aileler",
    packageCount: 64,
    familyCount: 42,
    notes: "Fotoğraf/PDF yükleme sonraki aşamada eklenecek.",
    statusLabel: "Rapor bekliyor"
  }
];

export const mockQurbanNotifications: QurbanNotification[] = [
  {
    id: "qnotif-001",
    orderId: "qorder-001",
    orderNo: "KRB-2026-0001",
    donorDisplayName: "M*** Y.",
    donorEmailMasked: "m***@example.org",
    donorPhoneMasked: "+90 5** *** 10 01",
    channel: "email",
    channelLabel: "E-posta",
    templateKey: "qurban_scheduled",
    status: "pending",
    statusLabel: "Bekliyor"
  },
  {
    id: "qnotif-002",
    orderId: "qorder-003",
    orderNo: "KRB-2026-0003",
    donorDisplayName: "S*** D.",
    donorEmailMasked: "s***@example.org",
    donorPhoneMasked: "+90 5** *** 10 03",
    channel: "sms",
    channelLabel: "SMS",
    templateKey: "qurban_slaughtered",
    status: "prepared",
    statusLabel: "Hazır"
  }
];

export const mockQurbanStats: QurbanStats = {
  totalOrders: mockQurbanOrders.length,
  totalShares: mockQurbanOrders.reduce((sum, order) => sum + order.shareCount, 0),
  delegationPending: mockQurbanOrders.filter((order) => order.delegationStatus === "pending").length,
  paymentPending: mockQurbanOrders.filter((order) => order.paymentStatus === "pending").length,
  scheduled: mockQurbanOrders.filter((order) => order.orderStatus === "scheduled").length,
  slaughtered: mockQurbanOrders.filter((order) => ["slaughtered", "distributed", "completed"].includes(order.orderStatus)).length,
  distributed: mockQurbanOrders.filter((order) => ["distributed", "completed"].includes(order.orderStatus)).length,
  notificationPending: mockQurbanNotifications.filter((notification) => notification.status !== "sent").length,
  regionBreakdown: [
    { label: "Yurt dışı", value: 3 },
    { label: "Yurt içi", value: 2 }
  ],
  typeBreakdown: [
    { label: "Vacip", value: 3 },
    { label: "Adak", value: 1 },
    { label: "Akika", value: 1 }
  ]
};
