import { NextRequest, NextResponse } from "next/server";

import { resolveApiActor } from "@/lib/api-auth";
import { getAccountBalance, recordApiRequest } from "@/lib/services/platform";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const balance = await getAccountBalance(actor, id);

  if (!balance) {
    return NextResponse.json({ error: "Balance not found." }, { status: 404 });
  }

  await recordApiRequest(actor, "accounts:balance");
  return NextResponse.json({ balance });
}
