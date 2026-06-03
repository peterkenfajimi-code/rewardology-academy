import { NextResponse } from "next/server";
import { fetchTabNews } from "@/lib/news/fetchFeeds";
import { isValidNewsTab } from "@/lib/news/feedConfig";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const tab = new URL(request.url).searchParams.get("tab");

  if (!isValidNewsTab(tab)) {
    return NextResponse.json({ status: "error", message: "Invalid tab" }, { status: 400 });
  }

  try {
    const items = await fetchTabNews(tab);
    return NextResponse.json(
      { status: "ok", items, fetchedAt: new Date().toISOString() },
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
