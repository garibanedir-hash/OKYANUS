import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { asAdminWriteClient } from "@/lib/data/adminWriteClient";
import type { Json } from "@/lib/supabase/types";
import { safeLogger } from "@/lib/observability/safeLogger";

type AuditPayload = {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, Json>;
};

export async function logAdminAction({
  actorId,
  action,
  entityType,
  entityId,
  summary,
  metadata = {}
}: AuditPayload) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  const db = asAdminWriteClient(supabase);
  const { error } = await db.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    new_value: {
      summary,
      metadata
    }
  });

  if (error && process.env.NODE_ENV !== "production") {
    safeLogger.warn("audit", "admin_action_log_failed", {
      code: error.code ?? "no-code",
      action,
      entityType
    });
  }
}
