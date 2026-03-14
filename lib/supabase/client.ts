"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient> | null = null;

export async function createSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  return client;
}
