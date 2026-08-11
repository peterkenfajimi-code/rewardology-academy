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
  const key =
    process.env.REPOSITORY_SUPABASE_SERVICE_KEY ??
    process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
