import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-utils";
import { resolveApiActor } from "@/lib/api-auth";
import {
  deleteAccount,
  enforceApiRateLimit,
  getAccountById,
  recordApiRequest,
  updateAccount,
} from "@/lib/services/platform";
import { accountUpdateSchema } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const account = await getAccountById(actor, id);
  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  await recordApiRequest(actor, "accounts:detail");
  return NextResponse.json({ account });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rateLimit = await enforceApiRateLimit(actor, "accounts:update");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded.", retryAt: rateLimit.retryAt },
        { status: 429 },
      );
    }

    const { id } = await params;
    const body = accountUpdateSchema.parse(await request.json());
    const account = await updateAccount(actor, id, body);
    await recordApiRequest(actor, "accounts:update");
    return NextResponse.json({ account });
  } catch (error) {
    return apiError(error, "Unable to update account.");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rateLimit = await enforceApiRateLimit(actor, "accounts:delete");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded.", retryAt: rateLimit.retryAt },
        { status: 429 },
      );
    }

    const { id } = await params;
    const result = await deleteAccount(actor, id);
    await recordApiRequest(actor, "accounts:delete");
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error, "Unable to delete account.");
  }
}
