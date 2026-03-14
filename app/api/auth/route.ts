import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { canUseLocalDemoAuth } from "@/lib/local-auth";
import {
  getAuthStatus,
  isSupabaseServiceUnavailableError,
  signInWithMagicLink,
  signInWithPassword,
  signOutCurrentUser,
  signUpPartnerAdmin,
} from "@/lib/services/auth";

function asErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

export async function GET() {
  const status = await getAuthStatus();
  return NextResponse.json({
    runtime: isSupabaseConfigured ? "supabase" : "mock",
    ...status,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (!isSupabaseConfigured) {
      return NextResponse.json({
        runtime: "mock",
        authenticated: true,
        message: "Mock mode bypassed auth request.",
      });
    }

    if (action === "login") {
      const result = await signInWithPassword(body.email, body.password);
      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, session: result.data.session });
    }

    if (action === "signup") {
      const result = await signUpPartnerAdmin(
        body.email,
        body.password,
        body.fullName,
        body.companyName,
      );
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "magic_link") {
      const result = await signInWithMagicLink(body.email);
      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "signout") {
      await signOutCurrentUser();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unsupported auth action." }, { status: 400 });
  } catch (error) {
    if (canUseLocalDemoAuth() && isSupabaseServiceUnavailableError(error)) {
      return NextResponse.json({
        runtime: "mock",
        authenticated: true,
        degraded: true,
        message:
          "Supabase auth is currently unavailable, so the local demo workspace was used instead.",
      });
    }

    return NextResponse.json(
      { error: asErrorMessage(error) },
      { status: 500 },
    );
  }
}
