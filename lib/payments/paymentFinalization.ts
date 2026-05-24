import "server-only";

import {
  appendPaymentEvent,
  appendPaymentStatusLog,
  type PaymentIntentRecord
} from "@/lib/data/paymentWriteRepository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RpcError = {
  code?: string;
  message?: string;
};

type RpcResult = {
  processed?: boolean;
  reason?: string;
  context_type?: string;
  duplicate?: boolean;
};

type RpcClient = {
  rpc: (
    functionName: string,
    args: Record<string, unknown>
  ) => Promise<{
    data: RpcResult | null;
    error: RpcError | null;
  }>;
};

function getRpcClient() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Ödeme finalizasyonu için server bağlantısı hazır değil.");
  }

  return supabase as unknown as RpcClient;
}

function friendlyFinalizationError(error: RpcError | null, fallback: string) {
  const message = error?.message ?? "";
  if (/permission|42501|row-level/i.test(message)) return "Bağlam güncellemesi için yetki doğrulaması tamamlanamadı.";
  if (/foreign key|23503/i.test(message)) return "Bağlı bağlam kaydı doğrulanamadı.";
  if (/invalid input value|22P02/i.test(message)) return "Bağlam durum geçişi geçerli değil.";
  if (/not_found/i.test(message)) return "Ödeme bağlamı bulunamadı.";
  if (/context_mismatch/i.test(message)) return "Ödeme bağlamı ödeme niyetiyle eşleşmedi.";
  return fallback;
}

async function appendFinalizationFailureEvent(paymentIntent: PaymentIntentRecord, error: unknown, phase: string) {
  const message = error instanceof Error ? error.message : "Ödeme bağlamı finalizasyonu tamamlanamadı.";

  await appendPaymentEvent({
    paymentIntentId: paymentIntent.id,
    eventType: "failed",
    oldStatus: paymentIntent.status,
    newStatus: paymentIntent.status,
    provider: paymentIntent.provider,
    rawEventSummary: {
      phase,
      finalization: "failed",
      contextType: paymentIntent.contextType,
      contextId: paymentIntent.contextId
    },
    actorRole: "paytr_callback",
    note: message
  });

  await appendPaymentStatusLog({
    paymentIntentId: paymentIntent.id,
    oldStatus: paymentIntent.status,
    newStatus: paymentIntent.status,
    eventType: `${phase}_finalization_failed`,
    actorRole: "paytr_callback",
    note: message
  });
}

async function callFinalizationRpc(functionName: string, args: Record<string, unknown>, fallbackMessage: string) {
  const client = getRpcClient();
  const { data, error } = await client.rpc(functionName, args);

  if (error) {
    throw new Error(friendlyFinalizationError(error, fallbackMessage));
  }

  return data ?? { processed: false, reason: "empty_rpc_response" };
}

function hasContextId(paymentIntent: PaymentIntentRecord) {
  return Boolean(paymentIntent.contextId);
}

export async function finalizePaidPaymentIntent(paymentIntent: PaymentIntentRecord) {
  if (paymentIntent.status !== "paid") return { finalized: false, reason: "not_paid" };

  try {
    switch (paymentIntent.contextType) {
      case "qurban_order":
        if (!hasContextId(paymentIntent)) return { finalized: false, reason: "missing_context_id" };
        return {
          finalized: true,
          result: await callFinalizationRpc(
            "finalize_qurban_payment",
            {
              p_payment_intent_id: paymentIntent.id,
              p_context_id: paymentIntent.contextId,
              p_actor_id: null
            },
            "Kurban ödeme finalizasyonu tamamlanamadı."
          )
        };

      case "orphan_sponsorship":
        if (!hasContextId(paymentIntent)) return { finalized: false, reason: "missing_context_id" };
        return {
          finalized: true,
          result: await callFinalizationRpc(
            "finalize_orphan_sponsorship_payment",
            {
              p_payment_intent_id: paymentIntent.id,
              p_context_id: paymentIntent.contextId,
              p_actor_id: null
            },
            "Yetim hamiliği ödeme finalizasyonu tamamlanamadı."
          )
        };

      case "general_donation":
      case "project_donation":
      case "campaign_donation":
        return {
          finalized: true,
          result: await callFinalizationRpc(
            "finalize_general_donation_payment",
            {
              p_payment_intent_id: paymentIntent.id,
              p_actor_id: null
            },
            "Bağış ödeme finalizasyonu tamamlanamadı."
          )
        };

      default:
        await appendPaymentStatusLog({
          paymentIntentId: paymentIntent.id,
          oldStatus: paymentIntent.status,
          newStatus: paymentIntent.status,
          eventType: "payment_paid_no_context_finalization",
          actorRole: "paytr_callback",
          note: "Bu ödeme bağlamı için ek finalizasyon kuralı tanımlı değil."
        });
        return { finalized: true, reason: "no_context_finalization" };
    }
  } catch (error) {
    await appendFinalizationFailureEvent(paymentIntent, error, "paid");
    return { finalized: false, reason: "context_finalization_failed" };
  }
}

export async function handleFailedPaymentIntent(paymentIntent: PaymentIntentRecord, reason = "Payment failed") {
  try {
    switch (paymentIntent.contextType) {
      case "qurban_order":
        if (!hasContextId(paymentIntent)) return { finalized: false, reason: "missing_context_id" };
        return {
          finalized: true,
          result: await callFinalizationRpc(
            "release_qurban_payment_reservation",
            {
              p_payment_intent_id: paymentIntent.id,
              p_context_id: paymentIntent.contextId,
              p_reason: reason
            },
            "Kurban ödeme rezervasyonu serbest bırakılamadı."
          )
        };

      case "orphan_sponsorship":
        if (!hasContextId(paymentIntent)) return { finalized: false, reason: "missing_context_id" };
        return {
          finalized: true,
          result: await callFinalizationRpc(
            "handle_orphan_sponsorship_payment_failed",
            {
              p_payment_intent_id: paymentIntent.id,
              p_context_id: paymentIntent.contextId,
              p_reason: reason
            },
            "Yetim hamiliği başarısız ödeme durumu işlenemedi."
          )
        };

      default:
        await appendPaymentStatusLog({
          paymentIntentId: paymentIntent.id,
          oldStatus: paymentIntent.status,
          newStatus: paymentIntent.status,
          eventType: "payment_failed_no_context_finalization",
          actorRole: "paytr_callback",
          note: reason
        });
        return { finalized: true, reason: "no_context_finalization" };
    }
  } catch (error) {
    await appendFinalizationFailureEvent(paymentIntent, error, "failed");
    return { finalized: false, reason: "context_finalization_failed" };
  }
}

export async function handleCancelledPaymentIntent(paymentIntent: PaymentIntentRecord, reason = "Payment cancelled") {
  try {
    switch (paymentIntent.contextType) {
      case "qurban_order":
        if (!hasContextId(paymentIntent)) return { finalized: false, reason: "missing_context_id" };
        return {
          finalized: true,
          result: await callFinalizationRpc(
            "release_qurban_payment_reservation",
            {
              p_payment_intent_id: paymentIntent.id,
              p_context_id: paymentIntent.contextId,
              p_reason: reason
            },
            "Kurban ödeme iptali sonrası rezervasyon serbest bırakılamadı."
          )
        };

      case "orphan_sponsorship":
        if (!hasContextId(paymentIntent)) return { finalized: false, reason: "missing_context_id" };
        return {
          finalized: true,
          result: await callFinalizationRpc(
            "handle_orphan_sponsorship_payment_failed",
            {
              p_payment_intent_id: paymentIntent.id,
              p_context_id: paymentIntent.contextId,
              p_reason: reason
            },
            "Yetim hamiliği iptal durumu işlenemedi."
          )
        };

      default:
        await appendPaymentStatusLog({
          paymentIntentId: paymentIntent.id,
          oldStatus: paymentIntent.status,
          newStatus: paymentIntent.status,
          eventType: "payment_cancelled_no_context_finalization",
          actorRole: "paytr_callback",
          note: reason
        });
        return { finalized: true, reason: "no_context_finalization" };
    }
  } catch (error) {
    await appendFinalizationFailureEvent(paymentIntent, error, "cancelled");
    return { finalized: false, reason: "context_finalization_failed" };
  }
}

export async function handleRefundedPaymentIntent(paymentIntent: PaymentIntentRecord, reason = "Payment refunded") {
  try {
    switch (paymentIntent.contextType) {
      case "qurban_order":
        if (!hasContextId(paymentIntent)) return { finalized: false, reason: "missing_context_id" };
        return {
          finalized: true,
          result: await callFinalizationRpc(
            "release_qurban_payment_reservation",
            {
              p_payment_intent_id: paymentIntent.id,
              p_context_id: paymentIntent.contextId,
              p_reason: reason
            },
            "Kurban ödeme iadesi sonrası rezervasyon serbest bırakılamadı."
          )
        };

      case "orphan_sponsorship":
        if (!hasContextId(paymentIntent)) return { finalized: false, reason: "missing_context_id" };
        return {
          finalized: true,
          result: await callFinalizationRpc(
            "handle_orphan_sponsorship_payment_failed",
            {
              p_payment_intent_id: paymentIntent.id,
              p_context_id: paymentIntent.contextId,
              p_reason: reason
            },
            "Yetim hamiliği iade durumu işlenemedi."
          )
        };

      default:
        await appendPaymentStatusLog({
          paymentIntentId: paymentIntent.id,
          oldStatus: paymentIntent.status,
          newStatus: paymentIntent.status,
          eventType: "payment_refunded_no_context_finalization",
          actorRole: "paytr_callback",
          note: reason
        });
        return { finalized: true, reason: "no_context_finalization" };
    }
  } catch (error) {
    await appendFinalizationFailureEvent(paymentIntent, error, "refunded");
    return { finalized: false, reason: "context_finalization_failed" };
  }
}
