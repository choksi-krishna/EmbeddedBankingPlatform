import { NextRequest, NextResponse } from "next/server";

import { resolveApiActor } from "@/lib/api-auth";
import { issueVirtualCard, listCards } from "@/lib/services/platform";

export async function GET(request: NextRequest) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ cards: await listCards(actor) });
}

export async function POST(request: NextRequest) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const card = await issueVirtualCard(actor, {
      userId: body.userId,
      accountId: body.accountId,
      cardholderName: body.cardholderName,
      spendingLimit: Number(body.spendingLimit),
    });
    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to issue card." },
      { status: 400 },
    );
  }
}
