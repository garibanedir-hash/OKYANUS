import "server-only";

import {
  appendPaymentStatusLog,
  enqueueNotification,
  prepareReceiptForPayment,
  type PaymentIntentRecord
} from "@/lib/data/paymentWriteRepository";

function contextNote(paymentIntent: PaymentIntentRecord) {
  switch (paymentIntent.contextType) {
    case "qurban_order":
      return "Kurban finalizasyonu bir sonraki aşamada qurban_orders, qurban_shares ve quota alanlarını atomik güncelleyecek.";
    case "orphan_sponsorship":
      return "Yetim hamiliği finalizasyonu bir sonraki aşamada sponsorships.status, payment_status ve next_payment_date alanlarını güncelleyecek.";
    case "general_donation":
    case "project_donation":
    case "campaign_donation":
      return "Bağış finalizasyonu bir sonraki aşamada bağış kaydını tamamlandı durumuna taşıyacak.";
    default:
      return "Manuel/admin bağlamı için ek iş kuralı bu aşamada çalıştırılmaz.";
  }
}

function notificationTemplateFor(paymentIntent: PaymentIntentRecord) {
  switch (paymentIntent.contextType) {
    case "qurban_order":
      return "qurban_payment_received_test";
    case "orphan_sponsorship":
      return "orphan_sponsorship_payment_received_test";
    default:
      return "payment_received_test";
  }
}

export async function finalizePaidPaymentIntent(paymentIntent: PaymentIntentRecord) {
  if (paymentIntent.status !== "paid") return { finalized: false, reason: "not_paid" };

  await prepareReceiptForPayment({
    paymentIntentId: paymentIntent.id,
    status: "pending",
    metadata: {
      source: "paytr_test_callback",
      contextType: paymentIntent.contextType,
      contextId: paymentIntent.contextId,
      note: "PDF üretimi sonraki aşamada yapılacak."
    }
  });

  await enqueueNotification({
    contextType: paymentIntent.contextType,
    contextId: paymentIntent.contextId,
    paymentIntentId: paymentIntent.id,
    donorAccountId: paymentIntent.donorAccountId,
    recipientEmail: paymentIntent.donorEmail,
    recipientPhone: paymentIntent.donorPhone,
    channel: "system",
    templateKey: notificationTemplateFor(paymentIntent),
    payload: {
      intentNo: paymentIntent.intentNo,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      provider: paymentIntent.provider,
      note: "Gerçek SMS/e-posta gönderimi yok; kuyruk hazırlığıdır."
    }
  });

  await appendPaymentStatusLog({
    paymentIntentId: paymentIntent.id,
    oldStatus: paymentIntent.status,
    newStatus: paymentIntent.status,
    eventType: "paytr_paid_finalization_prepared",
    actorRole: "paytr_callback",
    note: contextNote(paymentIntent)
  });

  return { finalized: true };
}

export async function handleFailedPaymentIntent(paymentIntent: PaymentIntentRecord) {
  await appendPaymentStatusLog({
    paymentIntentId: paymentIntent.id,
    oldStatus: paymentIntent.status,
    newStatus: paymentIntent.status,
    eventType: "paytr_failed_finalization_prepared",
    actorRole: "paytr_callback",
    note:
      paymentIntent.contextType === "qurban_order"
        ? "Başarısız ödeme sonrası kontenjan serbest bırakma planı sonraki aşamada atomik işlemle uygulanacak."
        : "Başarısız ödeme sonrası bağlam iş kuralı sonraki aşamada uygulanacak."
  });

  return { finalized: true };
}

export async function handleCancelledPaymentIntent(paymentIntent: PaymentIntentRecord) {
  await appendPaymentStatusLog({
    paymentIntentId: paymentIntent.id,
    oldStatus: paymentIntent.status,
    newStatus: paymentIntent.status,
    eventType: "paytr_cancelled_finalization_prepared",
    actorRole: "paytr_callback",
    note: "İptal edilen ödeme için bağlam finalizasyonu sonraki aşamada kontrollü yapılacak."
  });

  return { finalized: true };
}

