import { NextResponse } from "next/server";

/** Parent route — clients should call /api/news-feed/{tab}. */
export async function GET() {
  return NextResponse.json(
    { error: "Specify a tab: /api/news-feed/{tab}" },
    { status: 400 }
  );
}
