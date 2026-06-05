import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  isAuthPath,
  isProtectedPath,
  safeNextPath,
} from "@/lib/auth/routes";
import { FAVICON_SVG } from "@/lib/brand/favicon";

function isFaviconPath(pathname: string) {
  return (
    pathname === "/favicon.ico" ||
    pathname === "/favicon.svg" ||
    pathname === "/api/favicon" ||
    pathname === "/apple-touch-icon.png" ||
    pathname === "/apple-touch-icon.svg"
  );
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (isFaviconPath(pathname)) {
    return new NextResponse(FAVICON_SVG, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let res = NextResponse.next({ request: req });

  if (!url || !key) return res;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  if (isAuthPath(pathname) && user) {
    const dest = safeNextPath(req.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (isProtectedPath(pathname) && !user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/favicon.ico",
    "/favicon.svg",
    "/api/favicon",
    "/apple-touch-icon.png",
    "/apple-touch-icon.svg",
    "/courses/:path*",
    "/quizzes/:path*",
    "/comics/:path*",
    "/dashboard/:path*",
    "/api/course-centre/:path*",
    "/api/quiz-centre/:path*",
    "/login",
    "/signup",
  ],
};
