import { paymentContextTypeLabels, type PaymentContextType, type PaymentProvider } from "@/data/paymentMock";
import type { LegalConsentAuditFields } from "@/lib/legal/consent";

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
  provider?: PaymentProvider;
  metadata?: Record<string, unknown>;
  legalConsent?: LegalConsentAuditFields | null;
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
  legalConsent: LegalConsentAuditFields | null;
};

function normalizeText(value: string | null | undefined) {
  return value?.trim() || null;
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null;
}

export function normalizePaymentContext(input: PaymentContextInput): PaymentIntentDraft {
  validatePaymentContextAmount(input);

  return {
    contextType: input.contextType,
    contextId: input.contextId ?? null,
    donorAccountId: input.donorAccountId ?? null,
    donorName: normalizeText(input.donorName),
    donorEmail: normalizeEmail(input.donorEmail),
    donorPhone: normalizeText(input.donorPhone),
    amount: input.amount,
    currency: input.currency ?? "TRY",
    provider: input.provider ?? "manual",
    metadata: input.metadata ?? {},
    legalConsent: input.legalConsent ?? null
  };
}

export function validatePaymentContextAmount(context: Pick<PaymentContextInput, "amount" | "currency">) {
  if (!Number.isFinite(context.amount) || context.amount <= 0) {
    throw new Error("Ödeme tutarı sıfırdan büyük olmalıdır.");
  }

  if (context.amount < 1) {
    throw new Error("Ödeme tutarı en az 1 olmalıdır.");
  }

  const currency = context.currency ?? "TRY";
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error("Para birimi ISO formatında olmalıdır.");
  }
}

export function getPaymentContextDisplayName(contextType: PaymentContextType) {
  return paymentContextTypeLabels[contextType] ?? "Ödeme";
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
  legalConsent?: LegalConsentAuditFields | null;
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
    provider: "paytr",
    metadata: {
      summary: "Kurban siparişi ödeme hazırlığı",
      orderNo: input.orderNo ?? null,
      legalConsent: input.legalConsent ?? null
    },
    legalConsent: input.legalConsent ?? null
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
    provider: "paytr",
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
  note?: string | null;
  contactPermission?: boolean;
  legalConsent?: LegalConsentAuditFields | null;
}) {
  return normalizePaymentContext({
    contextType: "general_donation",
    contextId: input.donationId ?? null,
    donorAccountId: input.donorAccountId,
    donorName: input.donorName,
    donorEmail: input.donorEmail,
    donorPhone: input.donorPhone,
    amount: input.amount,
    currency: input.currency,
    provider: "paytr",
    metadata: {
      summary: "Genel bağış ödeme hazırlığı",
      donationType: input.donationType ?? "Genel Bağış",
      projectSlug: input.projectSlug ?? null,
      note: input.note ?? null,
      contactPermission: input.contactPermission ?? false,
      legalConsent: input.legalConsent ?? null
    },
    legalConsent: input.legalConsent ?? null
  });
}
