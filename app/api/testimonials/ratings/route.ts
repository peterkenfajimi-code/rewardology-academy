import { NextResponse } from "next/server";
import { fetchSourceRatings } from "@/lib/testimonials/fetchRatings";

export const runtime = "nodejs";

export async function GET() {
  const ratings = await fetchSourceRatings();
  return NextResponse.json(ratings, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
