import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildRequestUrl } from "@/lib/url";

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(
      buildRequestUrl(request, "/login", {
        error: "Missing auth code.",
      }),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      buildRequestUrl(request, "/login", {
        error: error.message,
      }),
    );
  }

  return NextResponse.redirect(buildRequestUrl(request, next));
}
