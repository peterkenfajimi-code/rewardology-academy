import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { fetchApprovedTestimonials } from "@/lib/testimonials/fetchApproved";
import { parseSubmitPayload } from "@/lib/testimonials/validate";
import type { TestimonialSourceType } from "@/lib/testimonials/types";

export const runtime = "nodejs";

const VALID_SOURCE = new Set<TestimonialSourceType>(["course", "quiz", "comic"]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const checkType = url.searchParams.get("sourceType");
  const checkId = url.searchParams.get("sourceId")?.trim();

  if (checkType && checkId) {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ submitted: false, authenticated: false });
    }
    if (!VALID_SOURCE.has(checkType as TestimonialSourceType)) {
      return NextResponse.json({ error: "Invalid source type" }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ submitted: false, authenticated: false });
      }

      const { data } = await supabase
        .from("testimonials")
        .select("id")
        .eq("user_id", user.id)
        .eq("source_type", checkType)
        .eq("source_id", checkId)
        .maybeSingle();

      return NextResponse.json({
        submitted: Boolean(data),
        authenticated: true,
      });
    } catch {
      return NextResponse.json({ submitted: false, authenticated: false });
    }
  }

  const items = await fetchApprovedTestimonials(6);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = parseSubmitPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const payload = parsed.data;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to submit feedback" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        user_id: user.id,
        source_type: payload.sourceType,
        source_id: payload.sourceId,
        source_label: payload.sourceLabel,
        rating: payload.rating,
        quote: payload.quote || null,
        display_name: payload.displayName,
        role_title: payload.roleTitle || null,
        location: payload.location || null,
        consent: payload.consent,
        status: "pending",
      })
      .select("id, status")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You already shared feedback for this activity" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Could not save feedback" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      id: data?.id,
      status: data?.status ?? "pending",
      message: "Thank you — your feedback is pending review before it appears on the homepage.",
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
