import { NextResponse, type NextRequest } from "next/server";
import { isRepositoryAdminAuthed } from "@/lib/auth/repository-admin";
import { normalizeDomain } from "@/lib/repository/company-logo";
import { fetchLogoDevLogo } from "@/lib/repository/logo-dev";

export async function GET(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const domain = normalizeDomain(req.nextUrl.searchParams.get("domain"));
  if (!domain) return NextResponse.json({ error: "Enter a valid domain, e.g. gtcoplc.com" }, { status: 400 });

  const result = await fetchLogoDevLogo(domain);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  return new NextResponse(Buffer.from(result.bytes), {
    headers: { "Content-Type": result.mime, "Cache-Control": "private, no-store" },
  });
}
