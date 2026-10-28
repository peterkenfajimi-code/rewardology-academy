import { NextResponse } from "next/server";
import { fetchTabNews } from "@/lib/news/fetchFeeds";
import { isValidNewsTab } from "@/lib/news/feedConfig";
import { clientIp, consumeRateLimit, rateLimitResponse } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ tab: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = rateLimitResponse(consumeRateLimit("news", clientIp(request), 60, 10 * 60 * 1000));
  if (limited) return limited;
  const tab = (await context.params).tab;

  if (!isValidNewsTab(tab)) {
    return NextResponse.json({ status: "error", message: "Invalid tab" }, { status: 400 });
  }

  try {
    const { items, warnings, provider } = await fetchTabNews(tab);
    return NextResponse.json(
      { status: "ok", items, warnings, provider, fetchedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load feeds";
    return NextResponse.json({ status: "error", message }, { status: 502 });
  }
}
