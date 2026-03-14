"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import {
  canUseLocalDemoAuth,
  LOCAL_DEMO_SESSION_COOKIE,
} from "@/lib/local-auth";
import {
  isSupabaseServiceUnavailableError,
  signInWithMagicLink,
  signInWithPassword,
  signOutCurrentUser,
  signUpPartnerAdmin,
} from "@/lib/services/auth";
import {
  authMagicLinkSchema,
  authPasswordSignInSchema,
  authRegisterSchema,
} from "@/lib/validation";

function redirectWithError(path: string, error: unknown): never {
  const message =
    error instanceof Error ? error.message : "The request could not be completed.";
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function shouldUseLocalDemoFallback(error: unknown) {
  return canUseLocalDemoAuth() && isSupabaseServiceUnavailableError(error);
}

async function enableLocalDemoSession() {
  const cookieStore = await cookies();
  cookieStore.set(LOCAL_DEMO_SESSION_COOKIE, "mock", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

async function clearLocalDemoSession() {
  const cookieStore = await cookies();
  cookieStore.delete(LOCAL_DEMO_SESSION_COOKIE);
}

export async function loginAction(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/dashboard");
  }

  const { email, password } = authPasswordSignInSchema.parse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  let result;

  try {
    result = await signInWithPassword(email, password);
  } catch (error) {
    if (shouldUseLocalDemoFallback(error)) {
      await enableLocalDemoSession();
      redirect(
        `/dashboard?message=${encodeURIComponent("Supabase auth is currently unavailable, so the app opened a local demo workspace instead.")}`,
      );
    }

    const message =
      error instanceof Error ? error.message : "The request could not be completed.";
    redirect(
      `/login?tab=password&email=${encodeURIComponent(email)}&error=${encodeURIComponent(message)}`,
    );
  }

  if (result.error) {
    if (shouldUseLocalDemoFallback(result.error)) {
      await enableLocalDemoSession();
      redirect(
        `/dashboard?message=${encodeURIComponent("Supabase auth is currently unavailable, so the app opened a local demo workspace instead.")}`,
      );
    }

    redirect(
      `/login?tab=password&email=${encodeURIComponent(email)}&error=${encodeURIComponent(result.error.message)}`,
    );
  }

  redirect("/dashboard");
}

export async function magicLinkAction(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/dashboard");
  }

  const { email } = authMagicLinkSchema.parse({
    email: String(formData.get("email") ?? ""),
  });

  let result;

  try {
    result = await signInWithMagicLink(email);
  } catch (error) {
    if (shouldUseLocalDemoFallback(error)) {
      await enableLocalDemoSession();
      redirect(
        `/dashboard?message=${encodeURIComponent("Supabase auth is currently unavailable, so the app opened a local demo workspace instead.")}`,
      );
    }

    const message =
      error instanceof Error ? error.message : "The request could not be completed.";
    redirect(
      `/login?tab=magic-link&email=${encodeURIComponent(email)}&error=${encodeURIComponent(message)}`,
    );
  }

  if (result.error) {
    if (shouldUseLocalDemoFallback(result.error)) {
      await enableLocalDemoSession();
      redirect(
        `/dashboard?message=${encodeURIComponent("Supabase auth is currently unavailable, so the app opened a local demo workspace instead.")}`,
      );
    }

    redirect(
      `/login?tab=magic-link&email=${encodeURIComponent(email)}&error=${encodeURIComponent(result.error.message)}`,
    );
  }

  redirect(
    `/login?tab=magic-link&email=${encodeURIComponent(email)}&message=${encodeURIComponent(`Magic link sent to ${email}.`)}`,
  );
}

export async function signupAction(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/dashboard");
  }

  const { fullName, companyName, email, password, partnerCode } =
    authRegisterSchema.parse({
      fullName: String(formData.get("fullName") ?? ""),
      companyName: String(formData.get("companyName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      partnerCode: String(formData.get("partnerCode") ?? "") || undefined,
    });

  try {
    const result = await signUpPartnerAdmin(
      email,
      password,
      fullName,
      companyName,
      partnerCode,
    );

    if (result.status === "existing_account") {
      redirect(
        `/login?tab=magic-link&email=${encodeURIComponent(email)}&message=${encodeURIComponent(`This email already has a workspace. Use the magic link tab to get back in quickly, or switch to password sign-in.`)}`,
      );
    }

    if (result.requiresEmailConfirmation) {
      redirect(
        `/login?tab=password&email=${encodeURIComponent(email)}&message=${encodeURIComponent(`Workspace created for ${email}. Confirm your email, then sign in.`)}`,
      );
    }
  } catch (error) {
    if (shouldUseLocalDemoFallback(error)) {
      await enableLocalDemoSession();
      redirect(
        `/dashboard?message=${encodeURIComponent("Workspace auth is currently unavailable, so the app opened a local demo workspace instead.")}`,
      );
    }

    redirectWithError("/signup", error);
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearLocalDemoSession();

  if (isSupabaseConfigured) {
    await signOutCurrentUser();
  }
  redirect("/");
}
