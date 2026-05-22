import type { PaymentContextType, PaymentProvider } from "@/data/paymentMock";

export type { PaymentContextType };

export type PaymentContextInput = {
  contextType: PaymentContextType;
  contextId?: string | null;
  donorAccountId?: string | null;
  donorName?: string | null;
  donorEmail?: string | null;
  donorPhone?: string | null;
  amount: number;
  currency?: string;
  metadata?: Record<string, unknown>;
};

export type PaymentIntentDraft = {
  contextType: PaymentContextType;
  contextId: string | null;
  donorAccountId: string | null;
  donorName: string | null;
  donorEmail: string | null;
  donorPhone: string | null;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  metadata: Record<string, unknown>;
};

function normalizeText(value: string | null | undefined) {
  return value?.trim() || null;
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null;
}

export function normalizePaymentContext(input: PaymentContextInput): PaymentIntentDraft {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Ödeme tutarı sıfırdan büyük olmalıdır.");
  }

  return {
    contextType: input.contextType,
    contextId: input.contextId ?? null,
    donorAccountId: input.donorAccountId ?? null,
    donorName: normalizeText(input.donorName),
    donorEmail: normalizeEmail(input.donorEmail),
    donorPhone: normalizeText(input.donorPhone),
    amount: input.amount,
    currency: input.currency ?? "TRY",
    provider: "manual",
    metadata: input.metadata ?? {}
  };
}

export function buildQurbanPaymentContext(input: {
  orderId: string;
  donorAccountId?: string | null;
  donorName?: string | null;
  donorEmail?: string | null;
  donorPhone?: string | null;
  totalAmount: number;
  currency?: string;
  orderNo?: string | null;
}) {
  return normalizePaymentContext({
    contextType: "qurban_order",
    contextId: input.orderId,
    donorAccountId: input.donorAccountId,
    donorName: input.donorName,
    donorEmail: input.donorEmail,
    donorPhone: input.donorPhone,
    amount: input.totalAmount,
    currency: input.currency,
    metadata: {
      summary: "Kurban siparişi ödeme hazırlığı",
      orderNo: input.orderNo ?? null
    }
  });
}

export function buildOrphanSponsorshipPaymentContext(input: {
  sponsorshipId?: string | null;
  applicationId?: string | null;
  donorAccountId?: string | null;
  donorName?: string | null;
  donorEmail?: string | null;
  donorPhone?: string | null;
  amount: number;
  currency?: string;
  sponsorshipNo?: string | null;
  applicationNo?: string | null;
}) {
  return normalizePaymentContext({
    contextType: "orphan_sponsorship",
    contextId: input.sponsorshipId ?? input.applicationId ?? null,
    donorAccountId: input.donorAccountId,
    donorName: input.donorName,
    donorEmail: input.donorEmail,
    donorPhone: input.donorPhone,
    amount: input.amount,
    currency: input.currency,
    metadata: {
      summary: "Yetim hamiliği ödeme hazırlığı",
      sponsorshipNo: input.sponsorshipNo ?? null,
      applicationNo: input.applicationNo ?? null
    }
  });
}

export function buildGeneralDonationPaymentContext(input: {
  donationId?: string | null;
  donorAccountId?: string | null;
  donorName?: string | null;
  donorEmail?: string | null;
  donorPhone?: string | null;
  amount: number;
  currency?: string;
  donationType?: string | null;
  projectSlug?: string | null;
}) {
  return normalizePaymentContext({
    contextType: input.projectSlug ? "project_donation" : "general_donation",
    contextId: input.donationId ?? null,
    donorAccountId: input.donorAccountId,
    donorName: input.donorName,
    donorEmail: input.donorEmail,
    donorPhone: input.donorPhone,
    amount: input.amount,
    currency: input.currency,
    metadata: {
      summary: "Genel bağış ödeme hazırlığı",
      donationType: input.donationType ?? "Genel Bağış",
      projectSlug: input.projectSlug ?? null
    }
  });
}
