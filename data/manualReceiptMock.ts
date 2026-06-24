import { isAdminDemoMode } from "@/config/admin";

const demoOnly = <T>(items: T[]) => (isAdminDemoMode ? items : []);

export type ManualReceiptStatus = "draft" | "prepared" | "printed" | "delivered" | "signed" | "archived" | "cancelled";

export type ManualReceiptPaymentMethod = "cash" | "bank_transfer" | "pos" | "manual_card" | "in_kind" | "other";

export type ManualReceiptDonationType =
  | "general_donation"
  | "qurban"
  | "orphan_sponsorship"
  | "zakat"
  | "sadaqah"
  | "emergency_aid"
  | "project_donation"
  | "campaign_donation"
  | "in_kind_donation"
  | "other";

export type ManualReceiptOutputType = "a4_landscape" | "thermal_80mm" | "booklet" | "custom_form";

export type ManualReceipt = {
  id: string;
  receiptNo: string;
  serialNo?: string;
  sequenceNo?: number;
  bookletNo?: string;
  outputType: ManualReceiptOutputType;
  outputTypeLabel: string;
  status: ManualReceiptStatus;
  statusLabel: string;
  receiptDate: string;
  branchName?: string;
  unitName?: string;
  donorType?: string;
  donorName: string;
  donorPhone?: string;
  donorEmail?: string;
  donorTaxIdMasked?: string;
  donorAddress?: string;
  donationType: ManualReceiptDonationType;
  donationTypeLabel: string;
  donationTypeOther?: string;
  campaignName?: string;
  projectName?: string;
  amount: number;
  currency: string;
  amountInWords?: string;
  paymentMethod: ManualReceiptPaymentMethod;
  paymentMethodLabel: string;
  paymentMethodOther?: string;
  purpose?: string;
  description?: string;
  collectorName?: string;
  accountingOfficerName?: string;
  approvedByName?: string;
  printedCount: number;
  lastPrintedAt?: string;
  deliveredAt?: string;
  signedAt?: string;
  archivedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  fileBucket?: string;
  filePath?: string;
  fileSizeBytes?: number;
  fileSha256?: string;
  generatedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ManualReceiptEvent = {
  id: string;
  manualReceiptId: string;
  eventType: string;
  oldStatus?: ManualReceiptStatus;
  newStatus?: ManualReceiptStatus;
  actorId?: string;
  actorRole?: string;
  note?: string;
  createdAt: string;
};

export const manualReceiptStatusLabels: Record<ManualReceiptStatus, string> = {
  draft: "Taslak",
  prepared: "Hazırlandı",
  printed: "Yazdırıldı",
  delivered: "Teslim Edildi",
  signed: "İmzalandı",
  archived: "Arşivlendi",
  cancelled: "İptal Edildi"
};

export const manualReceiptPaymentMethodLabels: Record<ManualReceiptPaymentMethod, string> = {
  cash: "Nakit",
  bank_transfer: "Havale/EFT",
  pos: "POS",
  manual_card: "Manuel Kart",
  in_kind: "Ayni",
  other: "Diğer"
};

export const manualReceiptDonationTypeLabels: Record<ManualReceiptDonationType, string> = {
  general_donation: "Genel Bağış",
  qurban: "Kurban",
  orphan_sponsorship: "Yetim Hamiliği",
  zakat: "Zekât",
  sadaqah: "Sadaka",
  emergency_aid: "Acil Yardım",
  project_donation: "Proje Bağışı",
  campaign_donation: "Kampanya Bağışı",
  in_kind_donation: "Ayni Bağış",
  other: "Diğer"
};

export const manualReceiptOutputTypeLabels: Record<ManualReceiptOutputType, string> = {
  a4_landscape: "A4 Yatay",
  thermal_80mm: "Termal 80mm",
  booklet: "Koçan",
  custom_form: "Özel Form"
};

export const mockManualReceipts: ManualReceipt[] = demoOnly([
  {
    id: "manual-receipt-demo-001",
    receiptNo: "MRC-2026-000001",
    serialNo: "A",
    sequenceNo: 125,
    bookletNo: "KCN-01",
    outputType: "a4_landscape",
    outputTypeLabel: manualReceiptOutputTypeLabels.a4_landscape,
    status: "prepared",
    statusLabel: manualReceiptStatusLabels.prepared,
    receiptDate: "2026-05-26T10:15:00.000Z",
    branchName: "Merkez",
    unitName: "Bağış Kabul",
    donorType: "individual",
    donorName: "A*** D.",
    donorPhone: "+90 5** *** 20 01",
    donorEmail: "a***@example.org",
    donorTaxIdMasked: "12*******90",
    donorAddress: "İstanbul / Türkiye",
    donationType: "general_donation",
    donationTypeLabel: manualReceiptDonationTypeLabels.general_donation,
    amount: 750,
    currency: "TRY",
    amountInWords: "Yedi yüz elli Türk Lirası",
    paymentMethod: "cash",
    paymentMethodLabel: manualReceiptPaymentMethodLabels.cash,
    purpose: "Genel insani yardım çalışmaları",
    collectorName: "Saha Görevlisi",
    accountingOfficerName: "Muhasebe Yetkilisi",
    approvedByName: "Dernek Yetkilisi",
    printedCount: 1,
    lastPrintedAt: "2026-05-26T10:22:00.000Z",
    createdAt: "2026-05-26T10:10:00.000Z",
    updatedAt: "2026-05-26T10:22:00.000Z"
  },
  {
    id: "manual-receipt-demo-002",
    receiptNo: "MRC-2026-000002",
    outputType: "a4_landscape",
    outputTypeLabel: manualReceiptOutputTypeLabels.a4_landscape,
    status: "cancelled",
    statusLabel: manualReceiptStatusLabels.cancelled,
    receiptDate: "2026-05-25T14:40:00.000Z",
    branchName: "Saha",
    donorType: "anonymous",
    donorName: "Anonim Bağışçı",
    donationType: "emergency_aid",
    donationTypeLabel: manualReceiptDonationTypeLabels.emergency_aid,
    amount: 300,
    currency: "TRY",
    paymentMethod: "cash",
    paymentMethodLabel: manualReceiptPaymentMethodLabels.cash,
    printedCount: 0,
    cancelledAt: "2026-05-25T15:00:00.000Z",
    cancelledReason: "Demo iptal gerekçesi",
    createdAt: "2026-05-25T14:38:00.000Z",
    updatedAt: "2026-05-25T15:00:00.000Z"
  }
]);

export const mockManualReceiptEvents: ManualReceiptEvent[] = demoOnly([
  {
    id: "manual-receipt-event-demo-001",
    manualReceiptId: "manual-receipt-demo-001",
    eventType: "manual_receipt.create",
    newStatus: "draft",
    note: "Demo manuel makbuz oluşturuldu.",
    createdAt: "2026-05-26T10:10:00.000Z"
  },
  {
    id: "manual-receipt-event-demo-002",
    manualReceiptId: "manual-receipt-demo-001",
    eventType: "manual_receipt.print",
    oldStatus: "prepared",
    newStatus: "printed",
    note: "Demo yazdırma kaydı.",
    createdAt: "2026-05-26T10:22:00.000Z"
  }
]);
