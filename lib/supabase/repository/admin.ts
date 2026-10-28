import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isRepositorySupabaseConfigured } from "@/lib/env";

if (typeof window !== "undefined") {
  throw new Error("Repository admin client cannot run in the browser");
}

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
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
