import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { rowToPublic, type PublicTestimonial, type TestimonialRow } from "@/lib/testimonials/types";

export async function fetchApprovedTestimonials(limit = 6): Promise<PublicTestimonial[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("status", "approved")
      .not("quote", "is", null)
      .order("reviewed_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit * 2);

    if (error || !data) return [];

    const mapped: PublicTestimonial[] = [];
    for (const row of data as TestimonialRow[]) {
      const pub = rowToPublic(row);
      if (pub) mapped.push(pub);
      if (mapped.length >= limit) break;
    }
    return mapped;
  } catch {
    return [];
  }
}
