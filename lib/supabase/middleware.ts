import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env, isSupabaseConfigured } from "@/lib/env";
import { canUseLocalDemoAuth, hasLocalDemoSession } from "@/lib/local-auth";
import { isSupabaseServiceUnavailableError } from "@/lib/supabase/errors";
import { buildRequestUrl } from "@/lib/url";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api");
  const isAuthRoute = ["/login", "/signup", "/register"].includes(pathname);
  const protectedPrefixes = [
    "/dashboard",
    "/accounts",
    "/transactions",
    "/cards",
    "/kyc",
    "/analytics",
    "/compliance",
    "/partners",
    "/api-keys",
  ];
  const isProtectedPage =
    !isApiRoute &&
    protectedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const localDemoSession =
    canUseLocalDemoAuth() && hasLocalDemoSession(request);

  if (localDemoSession) {
    if (isAuthRoute) {
      return NextResponse.redirect(buildRequestUrl(request, "/dashboard"));
    }

    return response;
  }

  if (!isSupabaseConfigured) {
    return response;
  }

  // Skip auth refresh on routes that never use redirect decisions.
  if (isApiRoute || (!isAuthRoute && !isProtectedPage)) {
    return response;
  }

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookieList) {
        cookieList.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        cookieList.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let user = null;

  try {
    const authResult = await supabase.auth.getUser();
    user = authResult.data.user;
  } catch (error) {
    if (canUseLocalDemoAuth() && isSupabaseServiceUnavailableError(error)) {
      return response;
    }

    throw error;
  }

  if (!user && isProtectedPage) {
    const redirectUrl = buildRequestUrl(request, "/login", {
      next: pathname,
    });
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    const redirectUrl = buildRequestUrl(request, "/dashboard");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
