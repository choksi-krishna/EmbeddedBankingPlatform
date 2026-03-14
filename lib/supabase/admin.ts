import { createClient } from "@supabase/supabase-js";

import { env, hasServiceRole, isSupabaseConfigured } from "@/lib/env";

let adminClient: ReturnType<typeof createClient> | null = null;

export async function createSupabaseAdminClient() {
  if (!isSupabaseConfigured || !hasServiceRole) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}
