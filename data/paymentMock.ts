export type PaymentContextType =
  | "general_donation"
  | "qurban_order"
  | "orphan_sponsorship"
  | "project_donation"
  | "campaign_donation"
  | "manual_admin_entry";

export type PaymentProvider = "manual" | "bank_transfer" | "virtual_pos" | "iyzico" | "paytr" | "stripe" | "other";

export type PaymentIntentStatus =
  | "draft"
  | "pending"
  | "initiated"
  | "requires_action"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

export type ReceiptStatus = "not_required" | "pending" | "prepared" | "issued" | "cancelled" | "failed";

export type NotificationChannel = "email" | "sms" | "whatsapp" | "system";

export type NotificationQueueStatus = "pending" | "processing" | "sent" | "failed" | "cancelled" | "skipped";

export type PaymentIntent = {
  id: string;
  intentNo: string;
  contextType: PaymentContextType;
  contextTypeLabel: string;
  contextId?: string;
  donorAccountId: string;
  donorDisplayName: string;
  donorEmailMasked: string;
  donorPhoneMasked: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerLabel: string;
  providerReferenceMasked?: string;
  status: PaymentIntentStatus;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  paidAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  metadataSummary: string;
};

export type Receipt = {
  id: string;
  receiptNo: string;
  paymentIntentId?: string;
  paymentIntentNo?: string;
  contextType: PaymentContextType;
  contextTypeLabel: string;
  contextId?: string;
  donorAccountId: string;
  donorDisplayName: string;
  donorEmailMasked: string;
  amount: number;
  currency: string;
  status: ReceiptStatus;
  statusLabel: string;
  issuedAt?: string;
  cancelledAt?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationQueueItem = {
  id: string;
  contextType?: PaymentContextType;
  contextTypeLabel: string;
  contextId?: string;
  paymentIntentId?: string;
  paymentIntentNo?: string;
  donorAccountId: string;
  recipientEmailMasked: string;
  recipientPhoneMasked: string;
  channel: NotificationChannel;
  channelLabel: string;
  templateKey: string;
  status: NotificationQueueStatus;
  statusLabel: string;
  scheduledAt?: string;
  sentAt?: string;
  failedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentStats = {
  totalIntents: number;
  pendingIntents: number;
  paidIntents: number;
  failedIntents: number;
  pendingReceipts: number;
  queuedNotifications: number;
};

export const paymentContextTypeLabels: Record<PaymentContextType, string> = {
  general_donation: "Genel Bağış",
  qurban_order: "Kurban",
  orphan_sponsorship: "Yetim Hamiliği",
  project_donation: "Proje Bağışı",
  campaign_donation: "Kampanya Bağışı",
  manual_admin_entry: "Manuel Kayıt"
};

export const paymentProviderLabels: Record<PaymentProvider, string> = {
  manual: "Manuel",
  bank_transfer: "EFT/Havale",
  virtual_pos: "Sanal POS",
  iyzico: "iyzico",
  paytr: "PayTR",
  stripe: "Stripe",
  other: "Diğer"
};

export const paymentIntentStatusLabels: Record<PaymentIntentStatus, string> = {
  draft: "Taslak",
  pending: "Ödeme bekliyor",
  initiated: "Başlatıldı",
  requires_action: "Ek işlem gerekli",
  paid: "Ödendi",
  failed: "Başarısız",
  cancelled: "İptal edildi",
  expired: "Süresi doldu",
  refunded: "İade edildi"
};

export const receiptStatusLabels: Record<ReceiptStatus, string> = {
  not_required: "Gerekli değil",
  pending: "Bekliyor",
  prepared: "Hazırlandı",
  issued: "Kesildi",
  cancelled: "İptal edildi",
  failed: "Hatalı"
};

export const notificationChannelLabels: Record<NotificationChannel, string> = {
  email: "E-posta",
  sms: "SMS",
  whatsapp: "WhatsApp",
  system: "Sistem"
};

export const notificationQueueStatusLabels: Record<NotificationQueueStatus, string> = {
  pending: "Bekliyor",
  processing: "İşleniyor",
  sent: "Gönderildi",
  failed: "Başarısız",
  cancelled: "İptal edildi",
  skipped: "Atlandı"
};

export const mockPaymentIntents: PaymentIntent[] = [
  {
    id: "payment-intent-001",
    intentNo: "PAY-2026-000001",
    contextType: "general_donation",
    contextTypeLabel: paymentContextTypeLabels.general_donation,
    donorAccountId: "demo-donor-account",
    donorDisplayName: "A*** D.",
    donorEmailMasked: "a***@example.org",
    donorPhoneMasked: "+90 5** *** 20 01",
    amount: 500,
    currency: "TRY",
    provider: "manual",
    providerLabel: paymentProviderLabels.manual,
    providerReferenceMasked: "manual-***001",
    status: "paid",
    statusLabel: paymentIntentStatusLabels.paid,
    createdAt: "2026-05-20T09:15:00.000Z",
    updatedAt: "2026-05-20T09:20:00.000Z",
    paidAt: "2026-05-20T09:20:00.000Z",
    metadataSummary: "Genel bağış demo ödeme niyeti"
  },
  {
    id: "payment-intent-002",
    intentNo: "PAY-2026-000002",
    contextType: "qurban_order",
    contextTypeLabel: paymentContextTypeLabels.qurban_order,
    contextId: "qorder-001",
    donorAccountId: "demo-donor-account",
    donorDisplayName: "M*** K.",
    donorEmailMasked: "m***@example.org",
    donorPhoneMasked: "+90 5** *** 20 02",
    amount: 6500,
    currency: "TRY",
    provider: "bank_transfer",
    providerLabel: paymentProviderLabels.bank_transfer,
    status: "pending",
    statusLabel: paymentIntentStatusLabels.pending,
    createdAt: "2026-05-21T11:45:00.000Z",
    updatedAt: "2026-05-21T11:45:00.000Z",
    expiresAt: "2026-05-28T11:45:00.000Z",
    metadataSummary: "Kurban siparişi ödeme hazırlığı"
  },
  {
    id: "payment-intent-003",
    intentNo: "PAY-2026-000003",
    contextType: "orphan_sponsorship",
    contextTypeLabel: paymentContextTypeLabels.orphan_sponsorship,
    contextId: "sponsorship-002",
    donorAccountId: "demo-donor-account-2",
    donorDisplayName: "G*** S.",
    donorEmailMasked: "g***@example.org",
    donorPhoneMasked: "+90 5** *** 20 03",
    amount: 1500,
    currency: "TRY",
    provider: "manual",
    providerLabel: paymentProviderLabels.manual,
    status: "failed",
    statusLabel: paymentIntentStatusLabels.failed,
    createdAt: "2026-05-19T14:00:00.000Z",
    updatedAt: "2026-05-19T14:30:00.000Z",
    failedAt: "2026-05-19T14:30:00.000Z",
    metadataSummary: "Yetim hamiliği ilk ödeme denemesi"
  }
];

export const mockReceipts: Receipt[] = [
  {
    id: "receipt-001",
    receiptNo: "RCPT-2026-000001",
    paymentIntentId: "payment-intent-001",
    paymentIntentNo: "PAY-2026-000001",
    contextType: "general_donation",
    contextTypeLabel: paymentContextTypeLabels.general_donation,
    donorAccountId: "demo-donor-account",
    donorDisplayName: "A*** D.",
    donorEmailMasked: "a***@example.org",
    amount: 500,
    currency: "TRY",
    status: "prepared",
    statusLabel: receiptStatusLabels.prepared,
    createdAt: "2026-05-20T09:21:00.000Z",
    updatedAt: "2026-05-20T09:21:00.000Z"
  },
  {
    id: "receipt-002",
    receiptNo: "RCPT-2026-000002",
    paymentIntentId: "payment-intent-002",
    paymentIntentNo: "PAY-2026-000002",
    contextType: "qurban_order",
    contextTypeLabel: paymentContextTypeLabels.qurban_order,
    contextId: "qorder-001",
    donorAccountId: "demo-donor-account",
    donorDisplayName: "M*** K.",
    donorEmailMasked: "m***@example.org",
    amount: 6500,
    currency: "TRY",
    status: "pending",
    statusLabel: receiptStatusLabels.pending,
    createdAt: "2026-05-21T11:50:00.000Z",
    updatedAt: "2026-05-21T11:50:00.000Z"
  }
];

export const mockNotificationQueue: NotificationQueueItem[] = [
  {
    id: "notification-queue-001",
    contextType: "general_donation",
    contextTypeLabel: paymentContextTypeLabels.general_donation,
    paymentIntentId: "payment-intent-001",
    paymentIntentNo: "PAY-2026-000001",
    donorAccountId: "demo-donor-account",
    recipientEmailMasked: "a***@example.org",
    recipientPhoneMasked: "+90 5** *** 20 01",
    channel: "email",
    channelLabel: notificationChannelLabels.email,
    templateKey: "payment_received_receipt_prepared",
    status: "pending",
    statusLabel: notificationQueueStatusLabels.pending,
    scheduledAt: "2026-05-20T10:00:00.000Z",
    createdAt: "2026-05-20T09:22:00.000Z",
    updatedAt: "2026-05-20T09:22:00.000Z"
  },
  {
    id: "notification-queue-002",
    contextType: "qurban_order",
    contextTypeLabel: paymentContextTypeLabels.qurban_order,
    contextId: "qorder-001",
    paymentIntentId: "payment-intent-002",
    paymentIntentNo: "PAY-2026-000002",
    donorAccountId: "demo-donor-account",
    recipientEmailMasked: "m***@example.org",
    recipientPhoneMasked: "+90 5** *** 20 02",
    channel: "sms",
    channelLabel: notificationChannelLabels.sms,
    templateKey: "qurban_payment_pending",
    status: "skipped",
    statusLabel: notificationQueueStatusLabels.skipped,
    errorMessage: "Gerçek SMS entegrasyonu bu aşamada kapalıdır.",
    createdAt: "2026-05-21T11:52:00.000Z",
    updatedAt: "2026-05-21T11:52:00.000Z"
  }
];

export const mockPaymentStats: PaymentStats = {
  totalIntents: mockPaymentIntents.length,
  pendingIntents: mockPaymentIntents.filter((item) => item.status === "pending").length,
  paidIntents: mockPaymentIntents.filter((item) => item.status === "paid").length,
  failedIntents: mockPaymentIntents.filter((item) => item.status === "failed").length,
  pendingReceipts: mockReceipts.filter((item) => item.status === "pending").length,
  queuedNotifications: mockNotificationQueue.filter((item) => item.status === "pending").length
};
