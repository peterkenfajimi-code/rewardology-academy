import { NextResponse } from "next/server";
import { fetchTabNews } from "@/lib/news/fetchFeeds";
import { isValidNewsTab } from "@/lib/news/feedConfig";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ tab: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const tab = (await context.params).tab;

  if (!isValidNewsTab(tab)) {
    return NextResponse.json({ status: "error", message: "Invalid tab" }, { status: 400 });
  }

  try {
    const { items, warnings } = await fetchTabNews(tab);
    return NextResponse.json(
      { status: "ok", items, warnings, fetchedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load feeds";
    return NextResponse.json({ status: "error", message }, { status: 502 });
  }
}
