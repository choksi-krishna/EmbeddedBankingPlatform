"use server";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import {
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
    redirectWithError("/login", error);
  }

  if (result.error) {
    redirectWithError("/login", result.error);
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
    redirectWithError("/login", error);
  }

  if (result.error) {
    redirectWithError("/login", result.error);
  }

  redirect(`/login?message=${encodeURIComponent(`Magic link sent to ${email}.`)}`);
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

  let result;

  try {
    result = await signUpPartnerAdmin(
      email,
      password,
      fullName,
      companyName,
      partnerCode,
    );
  } catch (error) {
    redirectWithError("/signup", error);
  }

  if (result.error) {
    redirectWithError("/signup", result.error);
  }

  if (!result.data.session) {
    redirect(
      `/login?message=${encodeURIComponent("Account created. Confirm your email, then sign in.")}`,
    );
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  if (isSupabaseConfigured) {
    await signOutCurrentUser();
  }
  redirect("/");
}
