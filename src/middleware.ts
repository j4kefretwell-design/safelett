import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getTrialAccessForUser } from "@/lib/trial-server";

function isTrialExemptPath(pathname: string): boolean {
  if (pathname === "/subscription" || pathname.startsWith("/subscription/")) {
    return true;
  }
  if (pathname === "/settings" || pathname === "/api/account") {
    return true;
  }
  if (pathname.startsWith("/api/stripe/")) {
    return true;
  }
  if (pathname === "/api/welcome-email") {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not add logic between createServerClient and auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Webhooks and public portal must always pass through
  if (
    pathname === "/api/stripe/webhook" ||
    pathname.startsWith("/portal/")
  ) {
    return supabaseResponse;
  }

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password");

  const isPublicPage =
    pathname === "/" ||
    isAuthPage ||
    pathname === "/reset-password" ||
    pathname.startsWith("/auth/confirm") ||
    pathname === "/privacy-policy" ||
    pathname === "/terms";

  if (!user && !isPublicPage && !pathname.startsWith("/api/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && !isPublicPage) {
    try {
      const access = await getTrialAccessForUser(supabase, user.id);

      if (!access.allowed && !isTrialExemptPath(pathname)) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            {
              error:
                "Your free trial has ended. Subscribe to continue.",
            },
            { status: 402 }
          );
        }

        const url = request.nextUrl.clone();
        url.pathname = "/subscription";
        url.searchParams.set("trial", "ended");
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("[middleware] trial access check failed", error);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
  runtime: "nodejs",
};
