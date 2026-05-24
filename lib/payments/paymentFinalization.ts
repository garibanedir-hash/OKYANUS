import "server-only";

import {
  appendPaymentStatusLog,
  enqueueNotification,
  prepareReceiptForPayment,
  type PaymentIntentRecord
} from "@/lib/data/paymentWriteRepository";
import { appendQurbanStatusLog } from "@/lib/data/qurbanWriteRepository";
import { appendSponsorshipStatusLog } from "@/lib/data/orphanSponsorshipWriteRepository";
import { asAdminWriteClient, type DbError } from "@/lib/data/adminWriteClient";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getAdminDb() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  return asAdminWriteClient(supabase);
}

function friendlyFinalizationError(error: DbError | null, fallback: string) {
  const message = error?.message ?? "";
  if (/permission|42501|row-level/i.test(message)) return "Bağlam güncellemesi için yetki doğrulaması tamamlanamadı.";
  if (/foreign key|23503/i.test(message)) return "Bağlı bağlam kaydı doğrulanamadı.";
  if (/invalid input value|22P02/i.test(message)) return "Bağlam durum geçişi geçerli değil.";
  return fallback;
}

function contextNote(paymentIntent: PaymentIntentRecord) {
  switch (paymentIntent.contextType) {
    case "qurban_order":
      return "Kurban ödeme durumu ve hisse durumları güncellenecek; quota_completed finalizasyonu 10C aşamasına bırakılır.";
    case "orphan_sponsorship":
      return "Yetim hamiliği ödeme durumu aktiflenir; next_payment_date yenileme stratejisi 10C/10D aşamasında netleşir.";
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

async function finalizeQurbanPaymentContext(paymentIntent: PaymentIntentRecord) {
  if (!paymentIntent.contextId) return;
  const db = getAdminDb();
  if (!db) throw new Error("Kurban ödeme finalizasyonu için server bağlantısı hazır değil.");

  const now = new Date().toISOString();
  const { error: orderError } = await db
    .from("qurban_orders")
    .update({
      payment_status: "paid",
      order_status: "payment_confirmed",
      receipt_status: "pending",
      updated_at: now
    })
    .eq("id", paymentIntent.contextId)
    .select("id")
    .single();

  if (orderError) {
    throw new Error(friendlyFinalizationError(orderError, "Kurban siparişi ödeme durumu güncellenemedi."));
  }

  const { error: shareError } = await db
    .from("qurban_shares")
    .update({ status: "payment_confirmed" })
    .eq("order_id", paymentIntent.contextId);

  if (shareError) {
    throw new Error(friendlyFinalizationError(shareError, "Kurban hisse durumları güncellenemedi."));
  }

  await appendQurbanStatusLog({
    orderId: paymentIntent.contextId,
    oldStatus: "payment_pending",
    newStatus: "payment_confirmed",
    actorRole: "paytr_callback",
    eventType: "payment_confirmed",
    note: "PayTR test callback ile ödeme onaylandı. Kontenjan completed finalizasyonu 10C aşamasına bırakıldı."
  });
}

async function finalizeOrphanSponsorshipPaymentContext(paymentIntent: PaymentIntentRecord) {
  if (!paymentIntent.contextId) return;
  const db = getAdminDb();
  if (!db) throw new Error("Sponsorluk ödeme finalizasyonu için server bağlantısı hazır değil.");

  const today = new Date().toISOString().slice(0, 10);
  const { error } = await db
    .from("sponsorships")
    .update({
      payment_status: "paid",
      status: "active",
      last_payment_date: today,
      updated_at: new Date().toISOString()
    })
    .eq("id", paymentIntent.contextId)
    .select("id")
    .single();

  if (error) {
    throw new Error(friendlyFinalizationError(error, "Sponsorluk ödeme durumu güncellenemedi."));
  }

  await appendSponsorshipStatusLog({
    sponsorshipId: paymentIntent.contextId,
    oldStatus: "payment_pending",
    newStatus: "active",
    eventType: "payment_confirmed",
    actorRole: "paytr_callback",
    note: "PayTR test callback ile ilk destek ödemesi onaylandı. next_payment_date hesaplama/yenileme 10C/10D aşamasında netleştirilecek."
  });
}

async function finalizeContextAfterPaid(paymentIntent: PaymentIntentRecord) {
  switch (paymentIntent.contextType) {
    case "qurban_order":
      await finalizeQurbanPaymentContext(paymentIntent);
      return;
    case "orphan_sponsorship":
      await finalizeOrphanSponsorshipPaymentContext(paymentIntent);
      return;
    default:
      return;
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

  try {
    await finalizeContextAfterPaid(paymentIntent);
  } catch (error) {
    await appendPaymentStatusLog({
      paymentIntentId: paymentIntent.id,
      oldStatus: paymentIntent.status,
      newStatus: paymentIntent.status,
      eventType: "context_finalization_failed",
      actorRole: "paytr_callback",
      note: error instanceof Error ? error.message : "Bağlam finalizasyonu tamamlanamadı."
    });

    return { finalized: false, reason: "context_finalization_failed" };
  }

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
