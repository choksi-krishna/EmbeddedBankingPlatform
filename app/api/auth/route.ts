import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { getAuthStatus, signInWithPassword, signOutCurrentUser, signUpPartnerAdmin } from "@/lib/services/auth";

export async function GET() {
  const status = await getAuthStatus();
  return NextResponse.json({
    runtime: isSupabaseConfigured ? "supabase" : "mock",
    ...status,
  });
}

export async function POST(request: Request) {
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
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, user: result.data.user });
  }

  if (action === "signout") {
    await signOutCurrentUser();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unsupported auth action." }, { status: 400 });
}
