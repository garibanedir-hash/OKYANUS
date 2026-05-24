import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type DbError = { code?: string; message?: string; details?: string; hint?: string };
export type DbResult<T> = Promise<{ data: T | null; error: DbError | null }>;
export type DbListResult<T> = Promise<{ data: T[] | null; error: DbError | null }>;

export type AdminWriteQuery<T> = {
  select: (columns?: string) => AdminWriteQuery<T>;
  insert: (values: Record<string, unknown> | Array<Record<string, unknown>>) => AdminWriteQuery<T>;
  update: (values: Record<string, unknown>) => AdminWriteQuery<T>;
  eq: (column: string, value: string | number | boolean) => AdminWriteQuery<T>;
  order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => AdminWriteQuery<T>;
  limit: (count: number) => AdminWriteQuery<T>;
  maybeSingle: () => DbResult<T>;
  single: () => DbResult<T>;
  then: DbListResult<T>["then"];
};

export type AdminWriteClient = {
  from: <T>(table: string) => AdminWriteQuery<T>;
};

export function asAdminWriteClient(client: SupabaseClient<Database>) {
  return client as unknown as AdminWriteClient;
}
