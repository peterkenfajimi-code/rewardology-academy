import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { DICTIONARY_XP_PER_TERM } from "@/lib/dictionary/terms";

export const runtime = "nodejs";

type ProgressRow = {
  term: string;
  xp: number;
  read_at: string;
};

const UNAUTH = NextResponse.json({ authenticated: false, terms: [], dictionaryXp: 0 });

export async function GET() {
  if (!isSupabaseConfigured()) return UNAUTH;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return UNAUTH;

    const { data, error } = await supabase
      .from("dictionary_progress")
      .select("term, xp, read_at")
      .eq("user_id", user.id)
      .order("read_at", { ascending: false });

    if (error) return UNAUTH;

    const rows = (data as ProgressRow[] | null) ?? [];
    const dictionaryXp = rows.reduce((s, r) => s + (r.xp ?? 0), 0);

    return NextResponse.json({
      authenticated: true,
      terms: rows.map((r) => r.term),
      dictionaryXp,
      termsRead: rows.length,
    });
  } catch {
    return UNAUTH;
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  let body: { term?: string; xp?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const term = body.term?.trim();
  if (!term) {
    return NextResponse.json({ error: "Missing term" }, { status: 400 });
  }

  const xp = body.xp ?? DICTIONARY_XP_PER_TERM;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to save progress" }, { status: 401 });
    }

    const { data: inserted, error: rpcError } = await supabase.rpc("record_dictionary_term", {
      p_term: term,
      p_xp: xp,
    });

    if (rpcError) {
      return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
    }

    const { data } = await supabase
      .from("dictionary_progress")
      .select("term, xp, read_at")
      .eq("user_id", user.id);

    const rows = (data as ProgressRow[] | null) ?? [];
    const dictionaryXp = rows.reduce((s, r) => s + (r.xp ?? 0), 0);

    return NextResponse.json({
      authenticated: true,
      terms: rows.map((r) => r.term),
      dictionaryXp,
      termsRead: rows.length,
      newlyAwarded: Boolean(inserted),
      xpEarned: inserted ? xp : 0,
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
