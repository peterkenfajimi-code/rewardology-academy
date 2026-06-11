import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { ESSENTIALS_ARTICLES, getEssentialById } from "@/lib/articles/essentials";

export const runtime = "nodejs";

type ProgressRow = {
  article_id: number;
  slug: string;
  xp: number;
  read_at: string;
};

function rowsToMap(rows: ProgressRow[] | null) {
  const map: Record<number, { xp: number; slug: string; readAt: string }> = {};
  for (const r of rows ?? []) {
    map[r.article_id] = { xp: r.xp, slug: r.slug, readAt: r.read_at };
  }
  return map;
}

const UNAUTH = NextResponse.json({ authenticated: false, completed: {} });

export async function GET() {
  if (!isSupabaseConfigured()) return UNAUTH;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return UNAUTH;

    const { data, error } = await supabase
      .from("article_progress")
      .select("article_id, slug, xp, read_at")
      .eq("user_id", user.id)
      .order("read_at", { ascending: false });

    if (error) return UNAUTH;

    const completed = rowsToMap(data as ProgressRow[]);
    const articleXp = Object.values(completed).reduce((s, r) => s + r.xp, 0);

    return NextResponse.json({
      authenticated: true,
      completed,
      articleXp,
      articlesRead: Object.keys(completed).length,
      articlesTotal: ESSENTIALS_ARTICLES.length,
    });
  } catch {
    return UNAUTH;
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  let body: { articleId?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const articleId = Number(body.articleId);
  const article = getEssentialById(articleId);
  if (!article) {
    return NextResponse.json({ error: "Unknown article" }, { status: 404 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to save progress" }, { status: 401 });
    }

    const { data: inserted, error: rpcError } = await supabase.rpc("record_article_read", {
      p_article_id: article.id,
      p_slug: article.slug,
      p_xp: article.xp,
    });

    if (rpcError) {
      return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
    }

    const { data } = await supabase
      .from("article_progress")
      .select("article_id, slug, xp, read_at")
      .eq("user_id", user.id);

    const completed = rowsToMap(data as ProgressRow[]);
    const articleXp = Object.values(completed).reduce((s, r) => s + r.xp, 0);

    return NextResponse.json({
      authenticated: true,
      completed,
      articleXp,
      articlesRead: Object.keys(completed).length,
      articlesTotal: ESSENTIALS_ARTICLES.length,
      newlyAwarded: Boolean(inserted),
      xpEarned: inserted ? article.xp : 0,
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
