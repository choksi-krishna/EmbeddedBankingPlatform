"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireViewer } from "@/lib/require-viewer";
import {
  createAccount,
  createPartnerApiKey,
  createTransfer,
  inviteUser,
  issueVirtualCard,
  registerWebhook,
  uploadKycDocument,
} from "@/lib/services/platform";

type ApiKeyState = {
  error?: string;
  rawKey?: string;
};

function parseNumber(value: FormDataEntryValue | null) {
  return Number(String(value ?? "0"));
}

export async function createAccountAction(formData: FormData) {
  const viewer = await requireViewer();
  await createAccount(viewer, {
    userId: String(formData.get("userId") ?? ""),
    nickname: String(formData.get("nickname") ?? ""),
    type: String(formData.get("type") ?? "operating") as "operating" | "wallet" | "reserve",
    currency: String(formData.get("currency") ?? "USD"),
  });
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
  redirect("/dashboard/accounts");
}

export async function createTransferAction(formData: FormData) {
  const viewer = await requireViewer();
  await createTransfer(viewer, {
    sourceAccountId: String(formData.get("sourceAccountId") ?? ""),
    destinationAccountId: String(formData.get("destinationAccountId") ?? ""),
    amount: parseNumber(formData.get("amount")),
    currency: String(formData.get("currency") ?? "USD"),
    rail: String(formData.get("rail") ?? "ach") as "ach" | "book",
    externalReference: String(formData.get("externalReference") ?? ""),
  });
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  redirect("/dashboard/transactions");
}

export async function issueCardAction(formData: FormData) {
  const viewer = await requireViewer();
  await issueVirtualCard(viewer, {
    userId: String(formData.get("userId") ?? ""),
    accountId: String(formData.get("accountId") ?? ""),
    cardholderName: String(formData.get("cardholderName") ?? ""),
    spendingLimit: parseNumber(formData.get("spendingLimit")),
  });
  revalidatePath("/dashboard/cards");
  revalidatePath("/dashboard");
  redirect("/dashboard/cards");
}

export async function uploadKycAction(formData: FormData) {
  const viewer = await requireViewer();
  const file = formData.get("document") as File | null;
  await uploadKycDocument(viewer, {
    userId: String(formData.get("userId") ?? ""),
    documentType: String(formData.get("documentType") ?? "passport") as
      | "passport"
      | "drivers_license"
      | "business_registration",
    fileName: file?.name ?? String(formData.get("fallbackFileName") ?? "document.bin"),
    notes: String(formData.get("notes") ?? ""),
    fileBytes: file ? await file.arrayBuffer() : undefined,
  });
  revalidatePath("/dashboard/kyc");
  revalidatePath("/dashboard/compliance");
  redirect("/dashboard/kyc");
}

export async function createApiKeyAction(
  _state: ApiKeyState,
  formData: FormData,
): Promise<ApiKeyState> {
  try {
    const viewer = await requireViewer();
    const result = await createPartnerApiKey(
      viewer,
      String(formData.get("name") ?? ""),
    );
    revalidatePath("/dashboard/api-keys");
    return { rawKey: result.rawKey };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to create API key.",
    };
  }
}

export async function registerWebhookAction(formData: FormData) {
  const viewer = await requireViewer();
  const events = String(formData.get("events") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  await registerWebhook(viewer, {
    url: String(formData.get("url") ?? ""),
    events,
  });
  revalidatePath("/dashboard/api-keys");
  redirect("/dashboard/api-keys");
}

export async function inviteUserAction(formData: FormData) {
  const viewer = await requireViewer();
  await inviteUser(viewer, {
    email: String(formData.get("email") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    role: String(formData.get("role") ?? "viewer") as
      | "partner_admin"
      | "operator"
      | "viewer",
  });
  revalidatePath("/dashboard/partners");
  redirect("/dashboard/partners");
}
