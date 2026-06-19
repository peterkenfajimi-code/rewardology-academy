import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  aggregateSourceRatings,
  EMPTY_RATINGS,
  type SourceRatings,
} from "@/lib/testimonials/ratings";
import type { TestimonialSourceType } from "@/lib/testimonials/types";

type RatingRow = {
  source_type: TestimonialSourceType;
  source_id: string;
  rating: number;
};

export async function fetchSourceRatings(): Promise<SourceRatings> {
  if (!isSupabaseConfigured()) return EMPTY_RATINGS;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("source_type, source_id, rating")
      .eq("status", "approved");

    if (error || !data) return EMPTY_RATINGS;
    return aggregateSourceRatings(data as RatingRow[]);
  } catch {
    return EMPTY_RATINGS;
  }
}
