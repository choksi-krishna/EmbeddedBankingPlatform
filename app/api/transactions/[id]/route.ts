import { NextRequest, NextResponse } from "next/server";

import { resolveApiActor } from "@/lib/api-auth";
import { getTransactionById, recordApiRequest } from "@/lib/services/platform";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const transaction = await getTransactionById(actor, id);

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  }

  await recordApiRequest(actor, "transactions:detail");
  return NextResponse.json({ transaction });
}
