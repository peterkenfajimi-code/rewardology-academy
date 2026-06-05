import { NextResponse } from "next/server";
import { FAVICON_SVG } from "@/lib/brand/favicon";

export const runtime = "edge";

export async function GET() {
  return new NextResponse(FAVICON_SVG, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
