import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-utils";
import { resolveApiActor } from "@/lib/api-auth";
import {
  createTransactionEntry,
  enforceApiRateLimit,
  listTransactions,
  recordApiRequest,
} from "@/lib/services/platform";
import {
  parseSearchParams,
  transactionCreateSchema,
  transactionFiltersSchema,
} from "@/lib/validation";

export async function GET(request: NextRequest) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rateLimit = await enforceApiRateLimit(actor, "transactions:list");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded.", retryAt: rateLimit.retryAt },
        { status: 429 },
      );
    }

    const filters = parseSearchParams(transactionFiltersSchema, request.nextUrl.searchParams);
    const transactions = await listTransactions(actor, filters);
    await recordApiRequest(actor, "transactions:list");

    return NextResponse.json({ transactions, rateLimit });
  } catch (error) {
    return apiError(error, "Unable to load transactions.");
  }
}

export async function POST(request: NextRequest) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rateLimit = await enforceApiRateLimit(actor, "transactions:create");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded.", retryAt: rateLimit.retryAt },
        { status: 429 },
      );
    }

    const body = transactionCreateSchema.parse(await request.json());
    const transaction = await createTransactionEntry(actor, body);
    await recordApiRequest(actor, "transactions:create");

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create transaction.");
  }
}
