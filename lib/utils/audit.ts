import type { SupabaseClient } from "@supabase/supabase-js";

type AuditOperation = "INSERT" | "UPDATE" | "DELETE";

export async function insertAuditLog(
  client: SupabaseClient,
  input: {
    table_name: string;
    record_id: string;
    operation: AuditOperation;
    old_data?: Record<string, unknown> | null;
    new_data?: Record<string, unknown> | null;
    performed_by?: string | null;
    ip_address?: string | null;
  },
) {
  const payload = {
    table_name: input.table_name,
    record_id: input.record_id,
    operation: input.operation,
    old_data: input.old_data ?? null,
    new_data: input.new_data ?? null,
    performed_by: input.performed_by ?? null,
    ip_address: input.ip_address ?? null,
  };

  const { error } = await client.from("audit_log").insert(payload);
  if (error) {
    throw new Error(`Failed to insert audit log: ${error.message}`);
  }
}
