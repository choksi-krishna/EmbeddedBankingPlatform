import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-utils";
import { resolveApiActor } from "@/lib/api-auth";
import {
  createAccount,
  enforceApiRateLimit,
  listAccounts,
  recordApiRequest,
} from "@/lib/services/platform";
import { accountCreateSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await enforceApiRateLimit(actor, "accounts:list");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded.", retryAt: rateLimit.retryAt },
      { status: 429 },
    );
  }

  const accounts = await listAccounts(actor);
  await recordApiRequest(actor, "accounts:list");
  return NextResponse.json({ accounts, rateLimit });
}

export async function POST(request: NextRequest) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rateLimit = await enforceApiRateLimit(actor, "accounts:create");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded.", retryAt: rateLimit.retryAt },
        { status: 429 },
      );
    }

    const body = accountCreateSchema.parse(await request.json());
    const result = await createAccount(actor, body);
    await recordApiRequest(actor, "accounts:create");
    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create account.");
  }
}
