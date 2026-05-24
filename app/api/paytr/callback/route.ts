import {
  appendPaymentEvent,
  getPaymentIntentByIntentNo,
  getPaymentIntentByProviderReference,
  getPaymentProviderEvent,
  markPaymentCancelled,
  markPaymentFailed,
  markPaymentPaidFromProvider,
  recordPaymentProviderEvent,
  type PaymentIntentRecord
} from "@/lib/data/paymentWriteRepository";
import {
  handleCancelledPaymentIntent,
  handleFailedPaymentIntent,
  finalizePaidPaymentIntent
} from "@/lib/payments/paymentFinalization";
import { mapPaytrStatus, verifyPaytrCallbackHash, type PaytrCallbackPayload } from "@/lib/payments/paytr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function textResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
}

async function parsePaytrCallback(request: Request): Promise<PaytrCallbackPayload> {
  const formData = await request.formData();
  const payload: PaytrCallbackPayload = {
    merchant_oid: "",
    status: "",
    total_amount: "",
    hash: ""
  };

  formData.forEach((value, key) => {
    payload[key] = typeof value === "string" ? value : value.name;
  });

  return payload;
}

function providerEventId(callback: PaytrCallbackPayload) {
  return [callback.merchant_oid || "missing-oid", callback.status || "missing-status", callback.total_amount || "missing-amount"].join(":");
}

function payloadSummary(callback: PaytrCallbackPayload) {
  return {
    merchant_oid: callback.merchant_oid,
    status: callback.status,
    total_amount: callback.total_amount,
    failed_reason_code: callback.failed_reason_code,
    failed_reason_msg: callback.failed_reason_msg,
    payment_type: callback.payment_type,
    currency: callback.currency,
    payment_amount: callback.payment_amount,
    installment_count: callback.installment_count,
    test_mode: callback.test_mode
  };
}

async function safeRecordProviderEvent(input: Parameters<typeof recordPaymentProviderEvent>[0]) {
  try {
    return await recordPaymentProviderEvent(input);
  } catch {
    return null;
  }
}

async function findPaymentIntent(callback: PaytrCallbackPayload): Promise<PaymentIntentRecord | null> {
  const byProviderReference = await getPaymentIntentByProviderReference("paytr", callback.merchant_oid);
  if (byProviderReference) return byProviderReference;

  return getPaymentIntentByIntentNo(callback.merchant_oid);
}

function isTerminalDuplicate(paymentIntent: PaymentIntentRecord, nextStatus: string) {
  if (paymentIntent.status === "paid" && nextStatus === "paid") return true;
  if (paymentIntent.status === "failed" && nextStatus === "failed") return true;
  if (paymentIntent.status === "cancelled" && nextStatus === "cancelled") return true;
  return paymentIntent.status === "refunded";
}

export async function POST(request: Request) {
  const callback = await parsePaytrCallback(request);
  const eventId = providerEventId(callback);
  const summary = payloadSummary(callback);

  if (!callback.merchant_oid || !callback.status || !callback.total_amount || !callback.hash) {
    await safeRecordProviderEvent({
      provider: "paytr",
      providerEventId: eventId,
      eventType: callback.status || "missing_required_fields",
      signatureVerified: false,
      processed: false,
      processingError: "PayTR callback zorunlu alanları eksik.",
      payloadSummary: summary
    });

    return textResponse("INVALID REQUEST", 400);
  }

  let signatureVerified = false;
  try {
    signatureVerified = verifyPaytrCallbackHash(callback);
  } catch {
    await safeRecordProviderEvent({
      provider: "paytr",
      providerEventId: eventId,
      eventType: callback.status,
      signatureVerified: false,
      processed: false,
      processingError: "PayTR server-side yapılandırması eksik.",
      payloadSummary: summary
    });

    return textResponse("CONFIG ERROR", 500);
  }

  if (!signatureVerified) {
    await safeRecordProviderEvent({
      provider: "paytr",
      providerEventId: eventId,
      eventType: callback.status,
      signatureVerified: false,
      processed: false,
      processingError: "PayTR hash doğrulaması başarısız.",
      payloadSummary: summary
    });

    return textResponse("INVALID HASH", 400);
  }

  const existingProviderEvent = await getPaymentProviderEvent("paytr", eventId);
  if (existingProviderEvent?.processed) return textResponse("OK");

  const nextStatus = mapPaytrStatus(callback.status);
  const paymentIntent = await findPaymentIntent(callback);
  if (!paymentIntent) {
    await safeRecordProviderEvent({
      provider: "paytr",
      providerEventId: eventId,
      eventType: callback.status,
      signatureVerified: true,
      processed: false,
      processingError: "PayTR callback için ödeme niyeti bulunamadı.",
      payloadSummary: summary
    });

    return textResponse("OK");
  }

  if (isTerminalDuplicate(paymentIntent, nextStatus)) {
    await safeRecordProviderEvent({
      provider: "paytr",
      providerEventId: eventId,
      eventType: callback.status,
      signatureVerified: true,
      processed: true,
      processingError: null,
      payloadSummary: { ...summary, duplicate: true, current_status: paymentIntent.status }
    });

    return textResponse("OK");
  }

  await appendPaymentEvent({
    paymentIntentId: paymentIntent.id,
    eventType: "provider_callback_received",
    oldStatus: paymentIntent.status,
    newStatus: nextStatus,
    provider: "paytr",
    providerEventId: eventId,
    rawEventSummary: summary,
    actorRole: "paytr_callback",
    note: "PayTR Bildirim URL callback alındı ve hash doğrulandı."
  });

  let updatedPaymentIntent: PaymentIntentRecord;
  if (nextStatus === "paid") {
    updatedPaymentIntent = await markPaymentPaidFromProvider({
      paymentIntentId: paymentIntent.id,
      providerReference: callback.merchant_oid,
      actorRole: "paytr_callback",
      note: "PayTR test callback status=success ile ödeme onaylandı."
    });
    await finalizePaidPaymentIntent(updatedPaymentIntent);
  } else if (nextStatus === "cancelled") {
    updatedPaymentIntent = await markPaymentCancelled({
      paymentIntentId: paymentIntent.id,
      providerReference: callback.merchant_oid,
      actorRole: "paytr_callback",
      note: "PayTR test callback ile ödeme iptal edildi."
    });
    await handleCancelledPaymentIntent(updatedPaymentIntent);
  } else {
    updatedPaymentIntent = await markPaymentFailed({
      paymentIntentId: paymentIntent.id,
      providerReference: callback.merchant_oid,
      actorRole: "paytr_callback",
      note: callback.failed_reason_msg
        ? `PayTR test callback başarısız: ${callback.failed_reason_msg}`
        : "PayTR test callback status=failed ile ödeme başarısız işaretlendi."
    });
    await handleFailedPaymentIntent(updatedPaymentIntent);
  }

  await safeRecordProviderEvent({
    provider: "paytr",
    providerEventId: eventId,
    eventType: callback.status,
    signatureVerified: true,
    processed: true,
    processingError: null,
    payloadSummary: { ...summary, payment_intent_id: updatedPaymentIntent.id, final_status: updatedPaymentIntent.status }
  });

  return textResponse("OK");
}

