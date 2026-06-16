import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { COMIC_XP_PER_ISSUE } from "@/lib/comics/progress";

export const runtime = "nodejs";

type ProgressRow = {
  slug: string;
  issue_number: number;
  xp: number;
  read_at: string;
};

const UNAUTH = NextResponse.json({ authenticated: false, slugs: [], comicsXp: 0 });

export async function GET() {
  if (!isSupabaseConfigured()) return UNAUTH;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return UNAUTH;

    const { data, error } = await supabase
      .from("comics_progress")
      .select("slug, issue_number, xp, read_at")
      .eq("user_id", user.id)
      .order("read_at", { ascending: false });

    if (error) return UNAUTH;

    const rows = (data as ProgressRow[] | null) ?? [];
    const comicsXp = rows.reduce((s, r) => s + (r.xp ?? 0), 0);

    return NextResponse.json({
      authenticated: true,
      slugs: rows.map((r) => r.slug),
      comicsXp,
      issuesRead: rows.length,
    });
  } catch {
    return UNAUTH;
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  let body: { slug?: string; issueNumber?: number; xp?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const slug = body.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const issueNumber = body.issueNumber;
  if (typeof issueNumber !== "number" || issueNumber < 1) {
    return NextResponse.json({ error: "Missing issue number" }, { status: 400 });
  }

  const xp = body.xp ?? COMIC_XP_PER_ISSUE;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to save progress" }, { status: 401 });
    }

    const { data: inserted, error: rpcError } = await supabase.rpc("record_comic_issue", {
      p_slug: slug,
      p_issue_number: issueNumber,
      p_xp: xp,
    });

    if (rpcError) {
      return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
    }

    const { data } = await supabase
      .from("comics_progress")
      .select("slug, issue_number, xp, read_at")
      .eq("user_id", user.id);

    const rows = (data as ProgressRow[] | null) ?? [];
    const comicsXp = rows.reduce((s, r) => s + (r.xp ?? 0), 0);

    return NextResponse.json({
      authenticated: true,
      slugs: rows.map((r) => r.slug),
      comicsXp,
      issuesRead: rows.length,
      newlyAwarded: Boolean(inserted),
      xpEarned: inserted ? xp : 0,
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
