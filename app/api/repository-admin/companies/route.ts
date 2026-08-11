import { NextResponse, type NextRequest } from "next/server";
import { isRepositoryAdminAuthed } from "@/lib/auth/repository-admin";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import { createRepositoryAdminClient } from "@/lib/supabase/repository/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) return unauthorized();
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ error: "Repository database not configured" }, { status: 503 });
  }

  const country = req.nextUrl.searchParams.get("country");
  const supabase = createRepositoryAdminClient();
  let query = supabase
    .from("companies")
    .select("*")
    .order("name", { ascending: true });

  if (country) query = query.eq("country", country);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ companies: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) return unauthorized();
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ error: "Repository database not configured" }, { status: 503 });
  }

  let body: {
    name?: string;
    country?: string;
    industry?: string;
    sub_industry?: string;
    company_size_band?: string;
    listed_status?: string;
    exchange_ticker?: string;
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.country?.trim()) {
    return NextResponse.json({ error: "Name and country are required" }, { status: 400 });
  }

  const supabase = createRepositoryAdminClient();
  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: body.name.trim(),
      country: body.country.trim(),
      industry: body.industry?.trim() || null,
      sub_industry: body.sub_industry?.trim() || null,
      company_size_band: body.company_size_band || null,
      listed_status: body.listed_status || null,
      exchange_ticker: body.exchange_ticker?.trim() || null,
      last_reviewed_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ company: data });
}
