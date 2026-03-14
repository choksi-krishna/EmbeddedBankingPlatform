import { env, hasServiceRole } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  bootstrapPartnerWorkspace,
  getViewer,
  joinPartnerWorkspace,
} from "@/lib/services/platform";

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createSupabaseServerClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithMagicLink(email: string, nextPath = "/dashboard") {
  const supabase = await createSupabaseServerClient();

  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${env.appUrl}/api/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });
}

export async function signOutCurrentUser() {
  const supabase = await createSupabaseServerClient();
  return supabase.auth.signOut();
}

export async function signUpPartnerAdmin(
  email: string,
  password: string,
  fullName: string,
  companyName: string,
  partnerCode?: string,
) {
  if (!hasServiceRole) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for workspace onboarding.",
    );
  }

  const supabase = await createSupabaseServerClient();
  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: companyName,
        partner_code: partnerCode?.trim() || null,
      },
    },
  });

  if (!result.error && result.data.user) {
    if (partnerCode?.trim()) {
      await joinPartnerWorkspace(result.data.user.id, email, fullName, partnerCode);
    } else {
      await bootstrapPartnerWorkspace(
        result.data.user.id,
        email,
        fullName,
        companyName,
      );
    }
  }

  return result;
}

export async function getAuthStatus() {
  const viewer = await getViewer();
  return {
    authenticated: Boolean(viewer),
    viewer,
  };
}
