import { NextResponse } from "next/server";

/** Parent route — clients should call /api/industry-news/{tab}. */
export async function GET() {
  return NextResponse.json(
    { error: "Specify a tab: /api/industry-news/{tab}" },
    { status: 400 }
  );
}
