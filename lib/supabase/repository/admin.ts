import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isRepositorySupabaseConfigured } from "@/lib/env";

let adminClient: SupabaseClient | null = null;

export function createRepositoryAdminClient(): SupabaseClient {
  if (!isRepositorySupabaseConfigured()) {
    throw new Error("Repository Supabase is not configured");
  }

  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL!,
      process.env.REPOSITORY_SUPABASE_SERVICE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }

  return adminClient;
}

export function createRepositoryReadClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_ANON_KEY;
  const serviceKey = process.env.REPOSITORY_SUPABASE_SERVICE_KEY;
  if (!url) return null;
  // Prefer anon key so RLS policies apply; fall back to service role for local dev only.
  const key = anonKey ?? serviceKey;
  if (!key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
