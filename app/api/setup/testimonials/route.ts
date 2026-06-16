import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { CONTACT_FORWARD_GMAIL } from "@/lib/site";
import type { TestimonialRow } from "@/lib/testimonials/types";

export const runtime = "nodejs";

async function getAdminSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  if (user.email.toLowerCase() !== CONTACT_FORWARD_GMAIL.toLowerCase()) return null;
  return supabase;
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const supabase = await getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data, error } = await supabase.rpc("list_pending_testimonials");
  if (error) {
    return NextResponse.json({ error: error.message || "Could not load queue" }, { status: 500 });
  }

  return NextResponse.json({ items: (data as TestimonialRow[]) ?? [] });
}

export async function PATCH(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const supabase = await getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  let body: { id?: string; status?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const id = body.id?.trim();
  const status = body.status;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabase.rpc("moderate_testimonial", {
    p_id: id,
    p_status: status,
  });

  if (error) {
    return NextResponse.json({ error: error.message || "Could not update" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id, status });
}
