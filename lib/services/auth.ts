import { env, hasServiceRole } from "@/lib/env";
import { isSupabaseServiceUnavailableError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  bootstrapPartnerWorkspace,
  getViewer,
  joinPartnerWorkspace,
} from "@/lib/services/platform";

export type WorkspaceOnboardingResult =
  | {
      status: "created";
      requiresEmailConfirmation: boolean;
    }
  | {
      status: "existing_account";
    };

const AUTH_REQUEST_TIMEOUT_MS = 12000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function withAuthTimeout<T>(task: Promise<T>, actionLabel: string) {
  let timeoutHandle: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(
        new Error(
          `${actionLabel} timed out after ${AUTH_REQUEST_TIMEOUT_MS / 1000} seconds. Check Supabase auth availability and try again.`,
        ),
      );
    }, AUTH_REQUEST_TIMEOUT_MS);
  });

  try {
    return await Promise.race([task, timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

function isDuplicateAuthError(message: string) {
  const normalizedMessage = message.toLowerCase();
  return (
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("already been registered") ||
    normalizedMessage.includes("already exists")
  );
}

async function findExistingAuthUserByEmail(email: string) {
  const admin = (await createSupabaseAdminClient()) as any;
  if (!admin) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for workspace onboarding.",
    );
  }

  const { data: existingWorkspaceUser, error: workspaceLookupError } = await admin
    .from("users")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  if (workspaceLookupError) {
    throw workspaceLookupError;
  }

  if (existingWorkspaceUser) {
    return existingWorkspaceUser;
  }

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const existingUser = data.users.find(
      (user: { email?: string | null }) =>
        user.email?.toLowerCase() === email,
    );
    if (existingUser) {
      return existingUser;
    }

    totalPages = data.total ? Math.max(1, Math.ceil(data.total / 200)) : 1;
    page += 1;
  }

  return null;
}

export { isSupabaseServiceUnavailableError };

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createSupabaseServerClient();
  return withAuthTimeout(
    supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    }),
    "Password sign-in",
  );
}

export async function signInWithMagicLink(email: string, nextPath = "/dashboard") {
  const supabase = await createSupabaseServerClient();
  const normalizedEmail = normalizeEmail(email);

  return withAuthTimeout(
    supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${env.appUrl}/api/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    }),
    "Magic link sign-in",
  );
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
): Promise<WorkspaceOnboardingResult> {
  if (!hasServiceRole) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for workspace onboarding.",
    );
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await findExistingAuthUserByEmail(normalizedEmail);

  if (existingUser) {
    return {
      status: "existing_account",
    };
  }

  const supabase = await createSupabaseServerClient();
  const result = await withAuthTimeout(
    supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          partner_code: partnerCode?.trim() || null,
        },
      },
    }),
    "Workspace signup",
  );

  if (result.error) {
    if (isDuplicateAuthError(result.error.message)) {
      return {
        status: "existing_account",
      };
    }

    throw result.error;
  }

  if (!result.data.user) {
    throw new Error("Unable to create the workspace account.");
  }

  if (partnerCode?.trim()) {
    await joinPartnerWorkspace(
      result.data.user.id,
      normalizedEmail,
      fullName,
      partnerCode,
    );
  } else {
    await bootstrapPartnerWorkspace(
      result.data.user.id,
      normalizedEmail,
      fullName,
      companyName,
    );
  }

  return {
    status: "created",
    requiresEmailConfirmation: !result.data.session,
  };
}

export async function getAuthStatus() {
  const viewer = await getViewer();
  return {
    authenticated: Boolean(viewer),
    viewer,
  };
}
